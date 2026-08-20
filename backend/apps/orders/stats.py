from django.db.models import Count, Max, Q, Sum
from django.utils import timezone
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Product
from apps.orders.models import Order


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.localdate()
        orders_today_qs = Order.objects.filter(created_at__date=today).exclude(
            status=Order.Status.CANCELLED
        )
        orders_today = orders_today_qs.count()
        revenue_today = orders_today_qs.aggregate(total=Sum("total"))["total"] or 0

        low_stock = Product.objects.filter(is_active=True, stock__lte=5).count()
        pending = Order.objects.filter(
            status__in=[
                Order.Status.PENDING,
                Order.Status.PAID,
                Order.Status.PROCESSING,
            ]
        ).count()

        recent = list(
            Order.objects.order_by("-created_at").values(
                "order_number",
                "full_name",
                "status",
                "total",
                "currency",
                "created_at",
            )[:8]
        )

        status_breakdown = list(
            Order.objects.values("status")
            .annotate(count=Count("id"))
            .order_by("status")
        )

        return Response(
            {
                "orders_today": orders_today,
                "revenue_today": str(revenue_today),
                "low_stock": low_stock,
                "pending_shipments": pending,
                "recent_orders": recent,
                "status_breakdown": status_breakdown,
            }
        )


class CustomerListView(APIView):
    """Customers derived from placed orders (guest checkout friendly)."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        search = (request.query_params.get("search") or "").strip()
        base = Order.objects.all()
        if search:
            base = base.filter(
                Q(email__icontains=search) | Q(full_name__icontains=search)
            )
        qs = (
            base.values("email", "full_name", "phone", "city")
            .annotate(
                order_count=Count("id"),
                total_spent=Sum("total"),
                last_order_at=Max("created_at"),
            )
            .order_by("-last_order_at")
        )
        results = list(qs[:100])
        return Response({"count": len(results), "results": results})
