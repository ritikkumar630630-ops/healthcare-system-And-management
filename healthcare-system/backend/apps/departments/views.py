"""Department CRUD views — admin only for write operations."""

from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Department
from .serializers import DepartmentSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow anyone authenticated to read; only admin can write."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'admin'


class DepartmentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/departments/       -> list all active departments
    POST /api/departments/       -> create department (admin only)
    """
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None  # return full list, no pagination


class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/departments/<id>/  -> get single department
    PATCH  /api/departments/<id>/  -> update (admin only)
    DELETE /api/departments/<id>/  -> delete (admin only)
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrReadOnly]