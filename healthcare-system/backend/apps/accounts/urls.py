"""accounts/urls.py"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    RegisterView,
    LogoutView,
    UserProfileView,
    ChangePasswordView,
    UserListView,
    UserDetailView,
    ToggleUserApprovalView,
)

urlpatterns = [
    path('login/',                          CustomTokenObtainPairView.as_view(), name='login'),
    path('register/',                       RegisterView.as_view(),              name='register'),
    path('logout/',                         LogoutView.as_view(),                name='logout'),
    path('token/refresh/',                  TokenRefreshView.as_view(),          name='token_refresh'),
    path('profile/',                        UserProfileView.as_view(),           name='profile'),
    path('change-password/',                ChangePasswordView.as_view(),        name='change-password'),  # ✅ new
    path('users/',                          UserListView.as_view(),              name='user-list'),
    path('users/<int:pk>/',                 UserDetailView.as_view(),            name='user-detail'),
    path('users/<int:pk>/toggle-approval/', ToggleUserApprovalView.as_view(),   name='toggle-approval'),
]