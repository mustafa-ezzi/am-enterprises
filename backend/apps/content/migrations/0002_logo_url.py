from django.db import migrations, models


def forwards_logo(apps, schema_editor):
    SiteSettings = apps.get_model("content", "SiteSettings")
    for row in SiteSettings.objects.all():
        old = getattr(row, "logo", None)
        if old and not getattr(row, "logo_url", ""):
            try:
                row.logo_url = old.url if hasattr(old, "url") else str(old)
            except Exception:
                row.logo_url = str(old) if old else ""
            row.save(update_fields=["logo_url"])


class Migration(migrations.Migration):
    dependencies = [
        ("content", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="sitesettings",
            name="logo_url",
            field=models.URLField(
                blank=True,
                default="",
                help_text="Cloudflare Images / CDN URL for the site logo",
                max_length=500,
            ),
        ),
        migrations.RunPython(forwards_logo, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="sitesettings",
            name="logo",
        ),
    ]
