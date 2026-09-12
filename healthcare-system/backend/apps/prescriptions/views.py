from rest_framework import generics, permissions
from .models import Prescription
from .serializers import PrescriptionSerializer


class PrescriptionListCreateView(generics.ListCreateAPIView):
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Prescription.objects.all()
        elif user.role == 'doctor':
            try:
                return Prescription.objects.filter(doctor=user.doctor_profile)
            except Exception:
                return Prescription.objects.none()
        elif user.role == 'patient':
            try:
                return Prescription.objects.filter(patient=user.patient_profile)
            except Exception:
                return Prescription.objects.none()
        return Prescription.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != 'doctor':
            self.permission_denied(self.request)
        serializer.save(doctor=self.request.user.doctor_profile)


class PrescriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
