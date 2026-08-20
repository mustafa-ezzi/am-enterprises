from django.contrib import admin

from .models import SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ("site_name", "slogan", "logo_url", "currency", "updated_at")
    fields = (
        "site_name",
        "slogan",
        "logo_url",
        "contact_email",
        "contact_phone",
        "contact_address",
        "about_blurb",
        "currency",
        "updated_at",
    )
    readonly_fields = ("updated_at",)

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
