from django.conf import settings
from django.db import models


class SiteSettings(models.Model):
    """Singleton-style site configuration controlled from the admin panel."""

    site_name = models.CharField(max_length=120, default="AM Enterprises")
    slogan = models.CharField(
        max_length=200,
        default="Your trust, our commitment",
    )
    logo_url = models.URLField(
        max_length=500,
        blank=True,
        help_text="Cloudflare Images / CDN URL for the site logo",
    )
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=40, blank=True)
    contact_address = models.TextField(blank=True)
    about_blurb = models.TextField(
        blank=True,
        default=(
            "AM Enterprises supplies trusted household products for everyday living. "
            "Your trust, our commitment."
        ),
    )
    currency = models.CharField(max_length=8, default="PKR")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site settings"
        verbose_name_plural = "Site settings"

    def __str__(self) -> str:
        return self.site_name

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls) -> "SiteSettings":
        obj, _ = cls.objects.get_or_create(
            pk=1,
            defaults={
                "site_name": getattr(settings, "SITE_NAME", "AM Enterprises"),
                "slogan": getattr(settings, "SITE_SLOGAN", "Your trust, our commitment"),
                "currency": getattr(settings, "DEFAULT_CURRENCY", "PKR"),
            },
        )
        return obj
