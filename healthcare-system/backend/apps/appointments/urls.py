from django.urls import path
from .views import AppointmentListCreateView, AppointmentDetailView, AvailableSlotsView, DashboardStatsView

urlpatterns = [
    path('', AppointmentListCreateView.as_view(), name='appointment-list'),
    path('<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),
    path('slots/', AvailableSlotsView.as_view(), name='available-slots'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
