from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter
from .models import Patient
from .serializers import PatientSerializer, PatientUpdateSerializer


class PatientListView(generics.ListAPIView):
    """Admin/Doctor: list all patients."""
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['patient_id', 'user__first_name', 'user__last_name', 'user__phone', 'city']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'doctor']:
            return Patient.objects.select_related('user').all().order_by('-created_at')
        return Patient.objects.none()


class MyPatientProfileView(APIView):
    """Patient: get own profile. Creates profile if it doesn't exist yet."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        patient, _ = Patient.objects.get_or_create(user=request.user)
        return Response(PatientSerializer(patient).data)

    def patch(self, request):
        patient, _ = Patient.objects.get_or_create(user=request.user)
        serializer = PatientUpdateSerializer(patient, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(PatientSerializer(patient).data)


class PatientDetailView(generics.RetrieveUpdateAPIView):
    """Admin: get or update any patient's record."""
    queryset = Patient.objects.select_related('user').all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PatientUpdateSerializer
        return PatientSerializer
