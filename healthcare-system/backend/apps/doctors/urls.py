"""doctors/urls.py"""

from django.urls import path
from .views import (
    DoctorListView,
    AdminCreateDoctorView,
    DoctorDetailView,
    DoctorScheduleView,
    MyDoctorProfileView,
)

urlpatterns = [
    path('',               DoctorListView.as_view(),         name='doctor-list'),
    path('add/',           AdminCreateDoctorView.as_view(),  name='doctor-add'),       # ✅ new
    path('<int:pk>/',      DoctorDetailView.as_view(),       name='doctor-detail'),
    path('schedule/update/', DoctorScheduleView.as_view(),  name='doctor-schedule'),
    path('me/',            MyDoctorProfileView.as_view(),    name='my-doctor-profile'),
]