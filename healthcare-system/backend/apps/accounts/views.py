"""accounts/views.py — complete, with ChangePasswordView added."""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from rest_framework.permissions import AllowAny


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class  = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class   = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'message': 'Registration successful.', 'user_id': user.id},
            status=status.HTTP_201_CREATED
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
        except Exception:
            pass
        return Response({'message': 'Logged out successfully.'})


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        return UserSerializer if self.request.method == 'GET' else UserUpdateSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Body: { "old_password": "...", "new_password": "..." }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user        = request.user
        old_password = request.data.get('old_password', '')
        new_password = request.data.get('new_password', '')

        if not old_password or not new_password:
            return Response(
                {'error': 'Both old_password and new_password are required.'},
                status=400
            )

        if not user.check_password(old_password):
            return Response(
                {'error': 'Current password is incorrect.'},
                status=400
            )

        if len(new_password) < 6:
            return Response(
                {'error': 'New password must be at least 6 characters.'},
                status=400
            )

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully.'})


class UserListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = UserSerializer
    queryset           = User.objects.all().order_by('-created_at')

    def get_queryset(self):
        if self.request.user.role != 'admin':
            return User.objects.none()
        return super().get_queryset()


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = UserSerializer
    queryset           = User.objects.all()

    def get_permissions(self):
        if self.request.user.role != 'admin':
            self.permission_denied(self.request)
        return super().get_permissions()


class ToggleUserApprovalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied.'}, status=403)
        try:
            user            = User.objects.get(pk=pk)
            user.is_approved = not user.is_approved
            user.save()
            return Response({'is_approved': user.is_approved})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)