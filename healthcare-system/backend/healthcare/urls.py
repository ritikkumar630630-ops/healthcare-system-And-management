"""Main URL configuration for healthcare project."""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import home

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/departments/', include('apps.departments.urls')),
    path('api/doctors/', include('apps.doctors.urls')),
    path('api/patients/', include('apps.patients.urls')),
    path('api/appointments/', include('apps.appointments.urls')),
    path('api/prescriptions/', include('apps.prescriptions.urls')),
    path('api/billing/', include('apps.billing.urls')),
    path('api/chatbot/', include('apps.chatbot.urls')),
    path('', home),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
