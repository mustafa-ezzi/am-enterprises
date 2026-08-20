from rest_framework import serializers

from apps.catalog.cloudflare import cloudflare_configured, upload_image_file

from .models import SiteSettings


class SiteSettingsSerializer(serializers.ModelSerializer):
    logo_file = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = SiteSettings
        fields = [
            "id",
            "site_name",
            "slogan",
            "logo_url",
            "logo_file",
            "contact_email",
            "contact_phone",
            "contact_address",
            "about_blurb",
            "currency",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]

    def validate(self, attrs):
        upload = attrs.pop("logo_file", None)
        if upload is not None:
            attrs["logo_url"] = upload_image_file(
                upload,
                filename=getattr(upload, "name", None),
            )
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Keep legacy key used by frontend
        data["logo"] = instance.logo_url or None
        data["logo_url"] = instance.logo_url or None
        data["cloudflare_configured"] = cloudflare_configured()
        return data
