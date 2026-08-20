from django.db import transaction
from rest_framework import serializers

from apps.catalog.models import Product

from .models import Order, OrderItem
from .pricing import shipping_cost_for


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "unit_price",
            "quantity",
            "line_total",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "full_name",
            "email",
            "phone",
            "address",
            "city",
            "postal_code",
            "notes",
            "shipping_method",
            "payment_method",
            "currency",
            "subtotal",
            "shipping_cost",
            "total",
            "tracking_number",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "order_number",
            "subtotal",
            "shipping_cost",
            "total",
            "created_at",
            "updated_at",
        ]


class OrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["status", "tracking_number", "notes"]


class CheckoutItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class CheckoutSerializer(serializers.Serializer):
    cart_key = serializers.CharField(required=False, allow_blank=True)
    items = CheckoutItemSerializer(many=True, required=False)
    full_name = serializers.CharField(max_length=160)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=40)
    address = serializers.CharField(max_length=255)
    city = serializers.CharField(max_length=120)
    postal_code = serializers.CharField(max_length=32, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    shipping_method = serializers.ChoiceField(choices=Order.ShippingMethod.choices)
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices)

    def validate(self, attrs):
        items = attrs.get("items") or []
        cart_key = attrs.get("cart_key")
        if not items and not cart_key:
            raise serializers.ValidationError("Provide cart_key or items.")
        return attrs


class CheckoutService:
    """Create order, decrement stock, clear cart."""

    @staticmethod
    @transaction.atomic
    def place(validated: dict, user=None) -> Order:
        from apps.cart.models import Cart
        from apps.orders.emails import send_order_confirmation
        from django.conf import settings

        lines = []
        cart = None

        if validated.get("items"):
            for row in validated["items"]:
                product = (
                    Product.objects.select_for_update()
                    .filter(pk=row["product_id"], is_active=True)
                    .first()
                )
                if not product:
                    raise serializers.ValidationError(
                        {"items": f"Product {row['product_id']} not found."}
                    )
                qty = row["quantity"]
                if product.stock < qty:
                    raise serializers.ValidationError(
                        {
                            "items": (
                                f"{product.name} only has {product.stock} in stock."
                            )
                        }
                    )
                lines.append((product, qty))
        else:
            cart = (
                Cart.objects.select_related()
                .prefetch_related("items__product")
                .filter(cart_key=validated["cart_key"])
                .first()
            )
            if not cart or not cart.items.exists():
                raise serializers.ValidationError({"cart_key": "Cart is empty."})
            for item in cart.items.select_related("product"):
                product = Product.objects.select_for_update().get(pk=item.product_id)
                if not product.is_active:
                    raise serializers.ValidationError(
                        {"items": f"{product.name} is unavailable."}
                    )
                if product.stock < item.quantity:
                    raise serializers.ValidationError(
                        {
                            "items": (
                                f"{product.name} only has {product.stock} in stock."
                            )
                        }
                    )
                lines.append((product, item.quantity))

        if not lines:
            raise serializers.ValidationError({"items": "No items to checkout."})

        subtotal = sum((p.price * q for p, q in lines), start=0)
        shipping = shipping_cost_for(validated["shipping_method"])
        total = subtotal + shipping

        order = Order.objects.create(
            order_number=Order.generate_order_number(),
            user=user if user and user.is_authenticated else None,
            status=Order.Status.PENDING,
            full_name=validated["full_name"],
            email=validated["email"],
            phone=validated["phone"],
            address=validated["address"],
            city=validated["city"],
            postal_code=validated.get("postal_code") or "",
            notes=validated.get("notes") or "",
            shipping_method=validated["shipping_method"],
            payment_method=validated["payment_method"],
            currency=getattr(settings, "DEFAULT_CURRENCY", "PKR"),
            subtotal=subtotal,
            shipping_cost=shipping,
            total=total,
        )

        for product, qty in lines:
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                product_sku=product.sku,
                unit_price=product.price,
                quantity=qty,
                line_total=product.price * qty,
            )
            product.stock -= qty
            product.save(update_fields=["stock", "updated_at"])

        if cart is None and validated.get("cart_key"):
            cart = Cart.objects.filter(cart_key=validated["cart_key"]).first()
        if cart:
            cart.items.all().delete()

        send_order_confirmation(order)
        return order
