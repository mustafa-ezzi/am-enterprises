from rest_framework import serializers

from .cloudflare import cloudflare_configured, upload_image_file
from .models import Brand, Category, Product, ProductImage


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = [
            "id",
            "name",
            "slug",
            "tagline",
            "description",
            "sort_order",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {"slug": {"required": False}}


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "parent",
            "description",
            "sort_order",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {"slug": {"required": False}}


class ProductImageSerializer(serializers.ModelSerializer):
    """
    Store Cloudflare delivery URL in DB.
    Write with `image_url` (paste) and/or `file` (upload → Cloudflare → URL).
    Read `image` + `image_url` as the same CDN string.
    """

    image = serializers.SerializerMethodField()
    file = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = ProductImage
        fields = [
            "id",
            "product",
            "image",
            "image_url",
            "file",
            "alt_text",
            "sort_order",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "image"]
        extra_kwargs = {"image_url": {"required": False, "allow_blank": True}}

    def get_image(self, obj):
        return obj.image_url or None

    def validate(self, attrs):
        upload = attrs.pop("file", None)
        if upload is not None:
            attrs["image_url"] = upload_image_file(
                upload,
                filename=getattr(upload, "name", None),
            )

        url = (attrs.get("image_url") or "").strip()
        if url:
            attrs["image_url"] = url
        elif self.instance is None or not self.instance.image_url:
            raise serializers.ValidationError(
                {
                    "image_url": (
                        "Paste a Cloudflare image_url, or upload a file. "
                        f"Cloudflare R2 is "
                        f"{'configured' if cloudflare_configured() else 'NOT configured'}."
                    )
                }
            )
        return attrs


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    brand_name = serializers.SerializerMethodField()
    brand_slug = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "sku",
            "price",
            "compare_at_price",
            "stock",
            "in_stock",
            "brand",
            "brand_name",
            "brand_slug",
            "category",
            "category_name",
            "is_featured",
            "is_active",
            "primary_image",
            "created_at",
        ]

    def get_brand_name(self, obj):
        return obj.brand.name if obj.brand_id else None

    def get_brand_slug(self, obj):
        return obj.brand.slug if obj.brand_id else None

    def get_primary_image(self, obj):
        image = obj.images.first()
        if not image or not image.image_url:
            return None
        return image.image_url


class ProductDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    brand_name = serializers.SerializerMethodField()
    brand_slug = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "sku",
            "description",
            "price",
            "compare_at_price",
            "stock",
            "in_stock",
            "brand",
            "brand_name",
            "brand_slug",
            "category",
            "category_name",
            "is_featured",
            "is_active",
            "images",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {"slug": {"required": False}}

    def get_brand_name(self, obj):
        return obj.brand.name if obj.brand_id else None

    def get_brand_slug(self, obj):
        return obj.brand.slug if obj.brand_id else None


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "sku",
            "description",
            "price",
            "compare_at_price",
            "stock",
            "brand",
            "category",
            "is_featured",
            "is_active",
        ]
        read_only_fields = ["id"]
        extra_kwargs = {"slug": {"required": False}}
