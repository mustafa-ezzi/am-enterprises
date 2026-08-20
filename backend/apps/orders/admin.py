from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "product",
        "product_name",
        "product_sku",
        "unit_price",
        "quantity",
        "line_total",
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "full_name",
        "email",
        "status",
        "total",
        "payment_method",
        "created_at",
    )
    list_filter = ("status", "payment_method", "shipping_method")
    search_fields = ("order_number", "email", "full_name", "phone")
    readonly_fields = (
        "order_number",
        "subtotal",
        "shipping_cost",
        "total",
        "created_at",
        "updated_at",
    )
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product_name", "quantity", "line_total")
