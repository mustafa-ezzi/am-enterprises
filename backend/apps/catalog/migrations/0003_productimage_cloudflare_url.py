from django.db import migrations, models


def forwards_copy_urls(apps, schema_editor):
    ProductImage = apps.get_model("catalog", "ProductImage")
    for row in ProductImage.objects.all():
        # Old ImageField stored under `image`; after AddField image_url exists.
        old = getattr(row, "image", None)
        if old and not row.image_url:
            try:
                row.image_url = old.url if hasattr(old, "url") else str(old)
            except Exception:
                row.image_url = str(old) if old else ""
            if row.image_url:
                row.save(update_fields=["image_url"])


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0002_brand"),
    ]

    operations = [
        migrations.AddField(
            model_name="productimage",
            name="image_url",
            field=models.URLField(
                blank=True,
                default="",
                help_text="Cloudflare Images (or CDN) delivery URL",
                max_length=500,
            ),
        ),
        migrations.RunPython(forwards_copy_urls, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="productimage",
            name="image",
        ),
        migrations.AlterField(
            model_name="productimage",
            name="image_url",
            field=models.URLField(
                blank=True,
                help_text="Cloudflare Images (or CDN) delivery URL",
                max_length=500,
            ),
        ),
    ]
