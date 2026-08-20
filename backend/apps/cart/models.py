import uuid

from django.conf import settings
from django.db import models


class Cart(models.Model):
    """Guest cart via cart_key; optional user for logged-in merge."""

    cart_key = models.CharField(max_length=64, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="carts",
        on_delete=models.SET_NULL,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return f"Cart {self.cart_key[:8]}"

    @staticmethod
    def new_key() -> str:
        return uuid.uuid4().hex

    @property
    def subtotal(self):
        from decimal import Decimal

        total = Decimal("0.00")
        for item in self.items.select_related("product"):
            total += item.line_total
        return total


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(
        "catalog.Product",
        related_name="cart_items",
        on_delete=models.CASCADE,
    )
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("cart", "product")
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.product} × {self.quantity}"

    @property
    def unit_price(self):
        return self.product.price

    @property
    def line_total(self):
        return self.product.price * self.quantity
