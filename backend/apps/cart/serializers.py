from rest_framework import serializers

from apps.catalog.models import Product

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source="product.id", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_slug = serializers.CharField(source="product.slug", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    price = serializers.DecimalField(
        source="product.price", max_digits=12, decimal_places=2, read_only=True
    )
    compare_at_price = serializers.DecimalField(
        source="product.compare_at_price",
        max_digits=12,
        decimal_places=2,
        read_only=True,
        allow_null=True,
    )
    stock = serializers.IntegerField(source="product.stock", read_only=True)
    primary_image = serializers.SerializerMethodField()
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product_id",
            "product_name",
            "product_slug",
            "product_sku",
            "price",
            "compare_at_price",
            "stock",
            "primary_image",
            "quantity",
            "line_total",
        ]

    def get_primary_image(self, obj):
        image = obj.product.images.first()
        if not image or not image.image_url:
            return None
        return image.image_url


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "cart_key", "items", "subtotal", "item_count", "updated_at"]

    def get_item_count(self, obj):
        return sum(item.quantity for item in obj.items.all())


class CartItemWriteSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)

    def validate(self, attrs):
        try:
            product = Product.objects.get(pk=attrs["product_id"], is_active=True)
        except Product.DoesNotExist as exc:
            raise serializers.ValidationError({"product_id": "Product not found."}) from exc
        if product.stock < attrs["quantity"]:
            raise serializers.ValidationError(
                {"quantity": f"Only {product.stock} in stock."}
            )
        attrs["product"] = product
        return attrs


class CartSyncSerializer(serializers.Serializer):
    items = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=True,
    )

    def validate_items(self, value):
        cleaned = []
        for row in value:
            product_id = row.get("product_id")
            quantity = int(row.get("quantity") or 0)
            if not product_id or quantity < 1:
                continue
            try:
                product = Product.objects.get(pk=product_id, is_active=True)
            except Product.DoesNotExist:
                continue
            cleaned.append(
                {
                    "product": product,
                    "quantity": min(quantity, max(product.stock, 0)),
                }
            )
        return cleaned
