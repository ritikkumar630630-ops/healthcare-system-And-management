from datetime import datetime, timedelta
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentStatusUpdateSerializer
from apps.patients.models import Patient
from apps.doctors.models import Doctor


class AppointmentListCreateView(generics.ListCreateAPIView):
    """List appointments based on role, or create a new appointment."""
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status', 'appointment_type', 'appointment_date']
    search_fields = ['patient__user__first_name', 'doctor__user__first_name']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Appointment.objects.select_related('patient__user', 'doctor__user').all()
        elif user.role == 'doctor':
            try:
                return Appointment.objects.filter(doctor=user.doctor_profile).select_related('patient__user')
            except Exception:
                return Appointment.objects.none()
        elif user.role == 'patient':
            try:
                return Appointment.objects.filter(patient=user.patient_profile).select_related('doctor__user')
            except Exception:
                return Appointment.objects.none()
        return Appointment.objects.none()

    def perform_create(self, serializer):
        """Patients auto-assign their own profile when booking."""
        user = self.request.user
        if user.role == 'patient':
            patient, _ = Patient.objects.get_or_create(user=user)
            serializer.save(patient=patient)
        else:
            serializer.save()


class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update status, or cancel an appointment."""
    queryset = Appointment.objects.select_related('patient__user', 'doctor__user')
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return AppointmentStatusUpdateSerializer
        return AppointmentSerializer


class AvailableSlotsView(APIView):
    """Return available time slots for a doctor on a given date."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        doctor_id = request.query_params.get('doctor_id')
        date_str = request.query_params.get('date')

        if not doctor_id or not date_str:
            return Response({'error': 'doctor_id and date are required.'}, status=400)

        try:
            doctor = Doctor.objects.get(pk=doctor_id)
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except (Doctor.DoesNotExist, ValueError):
            return Response({'error': 'Invalid doctor or date.'}, status=400)

        # Build all possible slots
        start = datetime.combine(date, doctor.start_time)
        end = datetime.combine(date, doctor.end_time)
        slot_minutes = doctor.slot_duration
        all_slots = []
        current = start
        while current < end:
            all_slots.append(current.time().strftime('%H:%M'))
            current += timedelta(minutes=slot_minutes)

        # Remove already-booked slots
        booked = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=date,
            status__in=['pending', 'approved']
        ).values_list('appointment_time', flat=True)
        booked_str = [t.strftime('%H:%M') for t in booked]

        available = [s for s in all_slots if s not in booked_str]
        return Response({'date': date_str, 'available_slots': available, 'booked_slots': booked_str})


class DashboardStatsView(APIView):
    """Admin dashboard statistics."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied.'}, status=403)

        from apps.accounts.models import User
        stats = {
            'total_patients': Patient.objects.count(),
            'total_doctors': Doctor.objects.count(),
            'total_appointments': Appointment.objects.count(),
            'pending_appointments': Appointment.objects.filter(status='pending').count(),
            'approved_appointments': Appointment.objects.filter(status='approved').count(),
            'completed_appointments': Appointment.objects.filter(status='completed').count(),
            'cancelled_appointments': Appointment.objects.filter(status='cancelled').count(),
            'total_users': User.objects.count(),
        }
        return Response(stats)
