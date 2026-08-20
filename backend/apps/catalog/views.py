from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from apps.accounts.permissions import IsAdminOrReadOnly

from .models import Brand, Category, Product, ProductImage
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    ProductDetailSerializer,
    ProductImageSerializer,
    ProductListSerializer,
    ProductWriteSerializer,
)


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"
    search_fields = ["name", "tagline", "description"]
    filterset_fields = ["is_active"]
    ordering_fields = ["sort_order", "name"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not (user and user.is_authenticated and user.is_staff):
            qs = qs.filter(is_active=True)
        return qs


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"
    search_fields = ["name", "description"]
    filterset_fields = ["is_active", "parent"]
    ordering_fields = ["sort_order", "name"]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("brand", "category").prefetch_related(
        "images"
    )
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        "category",
        "category__slug",
        "brand",
        "brand__slug",
        "is_featured",
        "is_active",
    ]
    search_fields = ["name", "sku", "description", "brand__name"]
    ordering_fields = ["price", "name", "created_at", "stock"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not (user and user.is_authenticated and user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return ProductListSerializer
        if self.action in ("create", "update", "partial_update"):
            return ProductWriteSerializer
        return ProductDetailSerializer


class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.select_related("product")
    serializer_class = ProductImageSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ["product"]
