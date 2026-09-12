"""apps/chatbot/urls.py"""

from django.urls import path
from .views import SymptomCheckerView

urlpatterns = [
    path('symptom-check/', SymptomCheckerView.as_view(), name='symptom-check'),
]