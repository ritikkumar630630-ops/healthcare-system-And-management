from rest_framework import generics, permissions
from .models import Bill
from .serializers import BillSerializer


class BillListCreateView(generics.ListCreateAPIView):
    serializer_class = BillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Bill.objects.all()
        elif user.role == 'patient':
            try:
                return Bill.objects.filter(patient=user.patient_profile)
            except Exception:
                return Bill.objects.none()
        return Bill.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role not in ['admin', 'doctor']:
            self.permission_denied(self.request)
        serializer.save()


class BillDetailView(generics.RetrieveUpdateAPIView):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    permission_classes = [permissions.IsAuthenticated]
