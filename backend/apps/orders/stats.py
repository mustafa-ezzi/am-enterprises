from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, Max, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Brand, Category, Product
from apps.orders.models import Order, OrderItem


def _day_series(days: int = 14):
    """Return list of {date, orders, revenue} for the last `days` including today."""
    today = timezone.localdate()
    start = today - timedelta(days=days - 1)
    qs = (
        Order.objects.filter(created_at__date__gte=start)
        .exclude(status=Order.Status.CANCELLED)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(orders=Count("id"), revenue=Sum("total"))
        .order_by("day")
    )
    by_day = {
        row["day"]: {
            "orders": row["orders"],
            "revenue": row["revenue"] or Decimal("0"),
        }
        for row in qs
    }
    series = []
    for i in range(days):
        d = start + timedelta(days=i)
        hit = by_day.get(d)
        series.append(
            {
                "date": d.isoformat(),
                "label": d.strftime("%b %d"),
                "orders": hit["orders"] if hit else 0,
                "revenue": str(hit["revenue"] if hit else Decimal("0")),
            }
        )
    return series


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.localdate()
        week_ago = today - timedelta(days=6)

        orders_today_qs = Order.objects.filter(created_at__date=today).exclude(
            status=Order.Status.CANCELLED
        )
        orders_today = orders_today_qs.count()
        revenue_today = orders_today_qs.aggregate(total=Sum("total"))["total"] or 0

        orders_week_qs = Order.objects.filter(created_at__date__gte=week_ago).exclude(
            status=Order.Status.CANCELLED
        )
        orders_week = orders_week_qs.count()
        revenue_week = orders_week_qs.aggregate(total=Sum("total"))["total"] or 0

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

        top_products = list(
            OrderItem.objects.exclude(order__status=Order.Status.CANCELLED)
            .values("product_name")
            .annotate(
                units=Sum("quantity"),
                revenue=Sum("line_total"),
            )
            .order_by("-units")[:6]
        )
        for row in top_products:
            row["revenue"] = str(row["revenue"] or 0)

        return Response(
            {
                "orders_today": orders_today,
                "revenue_today": str(revenue_today),
                "orders_week": orders_week,
                "revenue_week": str(revenue_week),
                "low_stock": low_stock,
                "pending_shipments": pending,
                "catalog": {
                    "products": Product.objects.filter(is_active=True).count(),
                    "categories": Category.objects.filter(is_active=True).count(),
                    "brands": Brand.objects.filter(is_active=True).count(),
                },
                "series_14d": _day_series(14),
                "recent_orders": recent,
                "status_breakdown": status_breakdown,
                "top_products": top_products,
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
