from django.core.mail import send_mail
from django.conf import settings


def send_order_confirmation(order) -> None:
    lines = [
        f"Thank you for your order, {order.full_name}.",
        "",
        f"Order number: {order.order_number}",
        f"Status: {order.get_status_display()}",
        f"Payment: {order.get_payment_method_display()}",
        f"Shipping: {order.get_shipping_method_display()} ({order.shipping_cost} {order.currency})",
        "",
        "Items:",
    ]
    for item in order.items.all():
        lines.append(
            f"- {item.product_name} × {item.quantity} = {item.line_total} {order.currency}"
        )
    lines.extend(
        [
            "",
            f"Subtotal: {order.subtotal} {order.currency}",
            f"Shipping: {order.shipping_cost} {order.currency}",
            f"Total: {order.total} {order.currency}",
            "",
            f"Ship to: {order.address}, {order.city} {order.postal_code}".strip(),
            "",
            "Your trust, our commitment",
            "AM Enterprises",
        ]
    )
    send_mail(
        subject=f"AM Enterprises order {order.order_number}",
        message="\n".join(lines),
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@amenterprises.local"),
        recipient_list=[order.email],
        fail_silently=True,
    )
