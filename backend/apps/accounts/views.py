from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import User
from .permissions import IsAdminRole
from .serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("username")
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]
    search_fields = ["username", "email", "first_name", "last_name"]
    filterset_fields = ["role", "is_active"]

    @action(detail=False, methods=["get"], permission_classes=[IsAdminRole])
    def me(self, request):
        return Response(UserSerializer(request.user).data)
