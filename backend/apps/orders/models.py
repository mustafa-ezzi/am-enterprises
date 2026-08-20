import secrets
from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        PROCESSING = "processing", "Processing"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    class ShippingMethod(models.TextChoices):
        STANDARD = "standard", "Standard"
        EXPRESS = "express", "Express"

    class PaymentMethod(models.TextChoices):
        COD = "cod", "Cash on delivery"
        BANK_TRANSFER = "bank_transfer", "Bank transfer"

    order_number = models.CharField(max_length=32, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="orders",
        on_delete=models.SET_NULL,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    full_name = models.CharField(max_length=160)
    email = models.EmailField()
    phone = models.CharField(max_length=40)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=120)
    postal_code = models.CharField(max_length=32, blank=True)
    notes = models.TextField(blank=True)
    shipping_method = models.CharField(
        max_length=20,
        choices=ShippingMethod.choices,
        default=ShippingMethod.STANDARD,
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.COD,
    )
    currency = models.CharField(max_length=8, default="PKR")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    shipping_cost = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00")
    )
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    tracking_number = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.order_number

    @classmethod
    def generate_order_number(cls) -> str:
        stamp = timezone.localtime().strftime("%Y%m%d")
        suffix = secrets.token_hex(3).upper()
        return f"AM-{stamp}-{suffix}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(
        "catalog.Product",
        null=True,
        blank=True,
        related_name="order_items",
        on_delete=models.SET_NULL,
    )
    product_name = models.CharField(max_length=200)
    product_sku = models.CharField(max_length=64)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField()
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.product_name} × {self.quantity}"
