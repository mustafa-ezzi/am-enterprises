from decimal import Decimal

from django.conf import settings

SHIPPING_RATES = {
    "standard": Decimal(str(getattr(settings, "SHIPPING_STANDARD", "250.00"))),
    "express": Decimal(str(getattr(settings, "SHIPPING_EXPRESS", "550.00"))),
}


def shipping_cost_for(method: str) -> Decimal:
    return SHIPPING_RATES.get(method, SHIPPING_RATES["standard"])
