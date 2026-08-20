"""
Seed catalogue + site settings for AM Enterprises.

Usage:
  python manage.py seed_catalog
  python manage.py seed_catalog --flush
"""

from decimal import Decimal

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from apps.catalog.models import Brand, Category, Product
from apps.content.models import SiteSettings

User = get_user_model()

BRANDS = [
    {
        "name": "Daisy",
        "slug": "daisy",
        "sort_order": 1,
        "tagline": "Soft living for every room",
        "description": (
            "Daisy brings calm, everyday essentials for cleaning, organization, "
            "bathroom, and laundry — gentle forms for the rest of the home."
        ),
    },
    {
        "name": "Kitchenware",
        "slug": "kitchenware",
        "sort_order": 2,
        "tagline": "Tools for the heart of the house",
        "description": (
            "Kitchenware is AM Enterprises’ cookware and prep line — durable "
            "pieces for daily cooking, storage, and the working kitchen."
        ),
    },
]

CATEGORIES = [
    {"name": "Kitchen Essentials", "slug": "kitchen-essentials", "sort_order": 1},
    {"name": "Cleaning Supplies", "slug": "cleaning-supplies", "sort_order": 2},
    {"name": "Home Organization", "slug": "home-organization", "sort_order": 3},
    {"name": "Bathroom", "slug": "bathroom", "sort_order": 4},
    {"name": "Laundry", "slug": "laundry", "sort_order": 5},
]

# brand slug keyed by product
PRODUCTS = [
    {
        "name": "Stainless Steel Mixing Bowl Set",
        "sku": "AM-KIT-001",
        "brand": "kitchenware",
        "category": "kitchen-essentials",
        "price": "2499.00",
        "compare_at_price": "2999.00",
        "stock": 40,
        "is_featured": True,
        "description": "Nesting set of three stainless steel mixing bowls for everyday prep.",
    },
    {
        "name": "Non-Stick Frying Pan 28cm",
        "sku": "AM-KIT-002",
        "brand": "kitchenware",
        "category": "kitchen-essentials",
        "price": "1899.00",
        "compare_at_price": None,
        "stock": 55,
        "is_featured": True,
        "description": "Durable non-stick pan with heat-resistant handle for daily cooking.",
    },
    {
        "name": "Glass Food Storage Containers (6-Pack)",
        "sku": "AM-KIT-003",
        "brand": "kitchenware",
        "category": "kitchen-essentials",
        "price": "3299.00",
        "compare_at_price": "3799.00",
        "stock": 30,
        "is_featured": False,
        "description": "Airtight glass containers ideal for leftovers and meal prep.",
    },
    {
        "name": "Multi-Surface Cleaner 1L",
        "sku": "AM-CLN-001",
        "brand": "daisy",
        "category": "cleaning-supplies",
        "price": "649.00",
        "compare_at_price": None,
        "stock": 120,
        "is_featured": True,
        "description": "Trusted formula for kitchens, counters, and hard floors.",
    },
    {
        "name": "Microfiber Cleaning Cloths (12-Pack)",
        "sku": "AM-CLN-002",
        "brand": "daisy",
        "category": "cleaning-supplies",
        "price": "899.00",
        "compare_at_price": "1099.00",
        "stock": 90,
        "is_featured": False,
        "description": "Lint-free cloths for streak-free polishing and dusting.",
    },
    {
        "name": "Floor Mop & Bucket Set",
        "sku": "AM-CLN-003",
        "brand": "daisy",
        "category": "cleaning-supplies",
        "price": "2199.00",
        "compare_at_price": None,
        "stock": 35,
        "is_featured": False,
        "description": "Spin mop system for quick, efficient floor cleaning.",
    },
    {
        "name": "Stackable Storage Bins (Set of 4)",
        "sku": "AM-ORG-001",
        "brand": "daisy",
        "category": "home-organization",
        "price": "2799.00",
        "compare_at_price": "3199.00",
        "stock": 45,
        "is_featured": True,
        "description": "Clear stackable bins to tidy closets, pantries, and shelves.",
    },
    {
        "name": "Over-the-Door Hook Rack",
        "sku": "AM-ORG-002",
        "brand": "daisy",
        "category": "home-organization",
        "price": "1299.00",
        "compare_at_price": None,
        "stock": 60,
        "is_featured": False,
        "description": "No-drill hanging rack for coats, towels, and bags.",
    },
    {
        "name": "Bamboo Drawer Organizer",
        "sku": "AM-ORG-003",
        "brand": "daisy",
        "category": "home-organization",
        "price": "1599.00",
        "compare_at_price": None,
        "stock": 50,
        "is_featured": False,
        "description": "Expandable bamboo tray for utensils and desk tools.",
    },
    {
        "name": "Cotton Bath Towel Set (4-Piece)",
        "sku": "AM-BTH-001",
        "brand": "daisy",
        "category": "bathroom",
        "price": "3499.00",
        "compare_at_price": "3999.00",
        "stock": 40,
        "is_featured": True,
        "description": "Soft absorbent towels for a calm, everyday bathroom refresh.",
    },
    {
        "name": "Shower Caddy Shelf",
        "sku": "AM-BTH-002",
        "brand": "daisy",
        "category": "bathroom",
        "price": "1199.00",
        "compare_at_price": None,
        "stock": 70,
        "is_featured": False,
        "description": "Rust-resistant caddy to keep bottles and soap orderly.",
    },
    {
        "name": "Laundry Basket with Lid",
        "sku": "AM-LND-001",
        "brand": "daisy",
        "category": "laundry",
        "price": "1799.00",
        "compare_at_price": None,
        "stock": 48,
        "is_featured": False,
        "description": "Ventilated laundry hamper with secure lid for tidy rooms.",
    },
    {
        "name": "Clothes Drying Rack Foldable",
        "sku": "AM-LND-002",
        "brand": "daisy",
        "category": "laundry",
        "price": "2499.00",
        "compare_at_price": "2899.00",
        "stock": 28,
        "is_featured": True,
        "description": "Space-saving foldable rack for indoor and outdoor drying.",
    },
    {
        "name": "Fabric Softener Sheets (80 Count)",
        "sku": "AM-LND-003",
        "brand": "daisy",
        "category": "laundry",
        "price": "799.00",
        "compare_at_price": None,
        "stock": 100,
        "is_featured": False,
        "description": "Fresh-scent dryer sheets for softer everyday laundry.",
    },
]


class Command(BaseCommand):
    help = "Seed brands, categories, household products, site settings, and a demo admin."

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete existing catalogue products/categories/brands before seeding.",
        )

    def handle(self, *args, **options):
        if options["flush"]:
            Product.objects.all().delete()
            Category.objects.all().delete()
            Brand.objects.all().delete()
            self.stdout.write(self.style.WARNING("Flushed catalogue data."))

        brand_map = {}
        for item in BRANDS:
            brand, created = Brand.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "name": item["name"],
                    "tagline": item["tagline"],
                    "description": item["description"],
                    "sort_order": item["sort_order"],
                    "is_active": True,
                },
            )
            brand_map[item["slug"]] = brand
            self.stdout.write(
                f"{'Created' if created else 'Updated'} brand: {brand.name}"
            )

        category_map = {}
        for item in CATEGORIES:
            cat, created = Category.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "name": item["name"],
                    "sort_order": item["sort_order"],
                    "is_active": True,
                    "description": f"{item['name']} for modern households.",
                },
            )
            category_map[item["slug"]] = cat
            self.stdout.write(
                f"{'Created' if created else 'Updated'} category: {cat.name}"
            )

        for item in PRODUCTS:
            product, created = Product.objects.update_or_create(
                sku=item["sku"],
                defaults={
                    "name": item["name"],
                    "brand": brand_map[item["brand"]],
                    "category": category_map[item["category"]],
                    "description": item["description"],
                    "price": Decimal(item["price"]),
                    "compare_at_price": (
                        Decimal(item["compare_at_price"])
                        if item["compare_at_price"]
                        else None
                    ),
                    "stock": item["stock"],
                    "is_featured": item["is_featured"],
                    "is_active": True,
                },
            )
            self.stdout.write(
                f"{'Created' if created else 'Updated'} product: {product.name} [{item['brand']}]"
            )

        site = SiteSettings.load()
        site.site_name = "AM Enterprises"
        site.slogan = "Your trust, our commitment"
        site.contact_email = "hello@amenterprises.local"
        site.contact_phone = "+92 300 0000000"
        site.contact_address = "Pakistan"
        site.about_blurb = (
            "AM Enterprises is home to Daisy and Kitchenware — trusted household "
            "lines for kitchens, cleaning, organization, bathroom, and laundry. "
            "Your trust, our commitment."
        )
        site.currency = "PKR"
        # Logo is a Cloudflare URL field — leave blank unless already set
        site.save()
        self.stdout.write(self.style.SUCCESS("Site settings saved."))

        admin_user, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@amenterprises.local",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            admin_user.set_password("admin123")
            admin_user.save()
            self.stdout.write(
                self.style.SUCCESS("Created admin user: admin / admin123")
            )
        else:
            self.stdout.write("Admin user already exists.")

        self.stdout.write(self.style.SUCCESS("Seed complete."))
