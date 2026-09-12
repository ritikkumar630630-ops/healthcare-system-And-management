from django.urls import path
from .views import PatientListView, MyPatientProfileView, PatientDetailView

urlpatterns = [
    path('', PatientListView.as_view(), name='patient-list'),
    path('me/', MyPatientProfileView.as_view(), name='my-patient-profile'),
    path('<int:pk>/', PatientDetailView.as_view(), name='patient-detail'),
]
