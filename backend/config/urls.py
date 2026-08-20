from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.accounts.views import UserViewSet
from apps.accounts.auth_views import CsrfView, LoginView, LogoutView, MeView
from apps.catalog.views import (
    BrandViewSet,
    CategoryViewSet,
    ProductImageViewSet,
    ProductViewSet,
)
from apps.content.views import SiteSettingsView
from apps.cart.views import (
    CartDetailView,
    CartItemDetailView,
    CartItemListCreateView,
    CartSyncView,
)
from apps.orders.views import CheckoutView, OrderByNumberView, OrderViewSet
from apps.orders.stats import AdminStatsView, CustomerListView

router = DefaultRouter()
router.register("users", UserViewSet, basename="user")
router.register("brands", BrandViewSet, basename="brand")
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")
router.register("product-images", ProductImageViewSet, basename="product-image")
router.register("orders", OrderViewSet, basename="order")


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response(
        {
            "status": "ok",
            "service": "AM Enterprises API",
            "slogan": "Your trust, our commitment",
        }
    )


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health, name="health"),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/auth/csrf/", CsrfView.as_view(), name="auth-csrf"),
    path("api/auth/login/", LoginView.as_view(), name="auth-login"),
    path("api/auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("api/auth/me/", MeView.as_view(), name="auth-me"),
    path("api/admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("api/admin/customers/", CustomerListView.as_view(), name="admin-customers"),
    path("api/site-settings/", SiteSettingsView.as_view(), name="site-settings"),
    path("api/cart/", CartDetailView.as_view(), name="cart-detail"),
    path("api/cart/items/", CartItemListCreateView.as_view(), name="cart-items"),
    path(
        "api/cart/items/<int:item_id>/",
        CartItemDetailView.as_view(),
        name="cart-item-detail",
    ),
    path("api/cart/sync/", CartSyncView.as_view(), name="cart-sync"),
    path("api/checkout/", CheckoutView.as_view(), name="checkout"),
    path(
        "api/orders/by-number/<str:order_number>/",
        OrderByNumberView.as_view(),
        name="order-by-number",
    ),
    path("api/", include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
