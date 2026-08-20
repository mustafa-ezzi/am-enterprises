from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user with staff/admin roles for the React admin panel."""

    class Role(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        STAFF = "staff", "Staff"
        ADMIN = "admin", "Admin"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
    )
    phone = models.CharField(max_length=32, blank=True)

    class Meta:
        ordering = ["username"]

    def __str__(self) -> str:
        return self.username

    @property
    def is_admin_role(self) -> bool:
        return self.role == self.Role.ADMIN or self.is_superuser

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = self.Role.ADMIN
        elif self.role in (self.Role.STAFF, self.Role.ADMIN):
            self.is_staff = True
        super().save(*args, **kwargs)
