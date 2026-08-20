from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.serializers import ValidationError
from rest_framework.views import APIView

from .models import Order
from .serializers import (
    CheckoutSerializer,
    CheckoutService,
    OrderSerializer,
    OrderStatusSerializer,
)


class CheckoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            order = CheckoutService.place(
                serializer.validated_data,
                user=request.user,
            )
        except ValidationError:
            raise
        return Response(
            OrderSerializer(order, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class OrderByNumberView(APIView):
    """Public confirmation lookup by order number."""

    permission_classes = [AllowAny]

    def get(self, request, order_number):
        order = (
            Order.objects.prefetch_related("items")
            .filter(order_number=order_number)
            .first()
        )
        if not order:
            return Response({"detail": "Order not found."}, status=404)
        return Response(OrderSerializer(order, context={"request": request}).data)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.prefetch_related("items").all()
    serializer_class = OrderSerializer
    lookup_field = "order_number"
    search_fields = ["order_number", "email", "full_name", "phone"]
    filterset_fields = ["status", "payment_method", "shipping_method"]
    ordering_fields = ["created_at", "total", "status"]
    http_method_names = ["get", "patch", "head", "options"]

    def get_permissions(self):
        if self.action == "retrieve":
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action == "partial_update":
            return OrderStatusSerializer
        return OrderSerializer

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = OrderStatusSerializer(
            instance, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(OrderSerializer(instance, context={"request": request}).data)
