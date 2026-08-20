from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem
from .serializers import (
    CartItemWriteSerializer,
    CartSerializer,
    CartSyncSerializer,
)


CART_HEADER = "HTTP_X_CART_KEY"


def resolve_cart(request, create=True) -> Cart | None:
    cart_key = request.headers.get("X-Cart-Key") or request.META.get(CART_HEADER)
    user = request.user if request.user.is_authenticated else None

    cart = None
    if user:
        cart = Cart.objects.filter(user=user).prefetch_related("items__product__images").first()
        if cart and cart_key and cart.cart_key != cart_key:
            # Merge guest cart into user cart
            guest = Cart.objects.filter(cart_key=cart_key).prefetch_related("items").first()
            if guest and guest.pk != cart.pk:
                for item in guest.items.all():
                    existing = cart.items.filter(product=item.product).first()
                    if existing:
                        existing.quantity = min(
                            item.product.stock,
                            existing.quantity + item.quantity,
                        )
                        existing.save(update_fields=["quantity", "updated_at"])
                    else:
                        item.cart = cart
                        item.save(update_fields=["cart", "updated_at"])
                guest.delete()
        if cart:
            return cart

    if cart_key:
        cart = (
            Cart.objects.filter(cart_key=cart_key)
            .prefetch_related("items__product__images")
            .first()
        )
        if cart:
            if user and cart.user_id is None:
                cart.user = user
                cart.save(update_fields=["user", "updated_at"])
            return cart

    if not create:
        return None

    cart = Cart.objects.create(
        cart_key=cart_key or Cart.new_key(),
        user=user,
    )
    return cart


class CartDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cart = resolve_cart(request, create=True)
        return Response(
            CartSerializer(cart, context={"request": request}).data
        )

    def delete(self, request):
        cart = resolve_cart(request, create=False)
        if cart:
            cart.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartItemListCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CartItemWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]
        cart = resolve_cart(request, create=True)

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity},
        )
        if not created:
            new_qty = min(product.stock, item.quantity + quantity)
            if new_qty < 1:
                return Response(
                    {"detail": "Out of stock."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.quantity = new_qty
            item.save(update_fields=["quantity", "updated_at"])

        cart.refresh_from_db()
        return Response(
            CartSerializer(cart, context={"request": request}).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class CartItemDetailView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, item_id):
        cart = resolve_cart(request, create=False)
        if not cart:
            return Response({"detail": "Cart not found."}, status=404)
        try:
            item = cart.items.select_related("product").get(pk=item_id)
        except CartItem.DoesNotExist:
            return Response({"detail": "Item not found."}, status=404)

        quantity = int(request.data.get("quantity", item.quantity))
        if quantity < 1:
            item.delete()
        else:
            item.quantity = min(item.product.stock, quantity)
            item.save(update_fields=["quantity", "updated_at"])

        cart.refresh_from_db()
        return Response(CartSerializer(cart, context={"request": request}).data)

    def delete(self, request, item_id):
        cart = resolve_cart(request, create=False)
        if not cart:
            return Response({"detail": "Cart not found."}, status=404)
        deleted, _ = cart.items.filter(pk=item_id).delete()
        if not deleted:
            return Response({"detail": "Item not found."}, status=404)
        cart.refresh_from_db()
        return Response(CartSerializer(cart, context={"request": request}).data)


class CartSyncView(APIView):
    """Replace cart contents from client localStorage lines."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CartSyncSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = resolve_cart(request, create=True)
        cart.items.all().delete()
        for row in serializer.validated_data["items"]:
            if row["quantity"] < 1:
                continue
            CartItem.objects.create(
                cart=cart,
                product=row["product"],
                quantity=row["quantity"],
            )
        cart.refresh_from_db()
        return Response(CartSerializer(cart, context={"request": request}).data)
