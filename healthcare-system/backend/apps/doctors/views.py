"""doctors/views.py"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import Doctor
from .serializers import DoctorSerializer, DoctorCreateSerializer, AdminCreateDoctorSerializer


class DoctorListView(generics.ListAPIView):
    """
    List all doctors.
    pagination_class = None  ->  returns ALL doctors at once (no 10-per-page limit).
    Admin sees everyone; others see only available doctors.
    """
    serializer_class   = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter]
    filterset_fields   = ['department', 'is_available']
    search_fields      = ['specialization', 'user__first_name', 'user__last_name']
    pagination_class   = None  # ✅ KEY FIX — no pagination, return all

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Doctor.objects.select_related('user', 'department').all().order_by('user__first_name')
        return Doctor.objects.select_related('user', 'department').filter(is_available=True).order_by('user__first_name')


class AdminCreateDoctorView(APIView):
    """Admin: Create User (role=doctor) + Doctor profile in one step."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can create doctors.'}, status=403)
        serializer = AdminCreateDoctorSerializer(data=request.data)
        if serializer.is_valid():
            doctor = serializer.save()
            return Response(DoctorSerializer(doctor).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DoctorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a doctor profile."""
    queryset           = Doctor.objects.select_related('user', 'department')
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DoctorCreateSerializer
        return DoctorSerializer

    def destroy(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can delete doctors.'}, status=403)
        return super().destroy(request, *args, **kwargs)


class DoctorScheduleView(APIView):
    """Doctor: update own schedule."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        if request.user.role != 'doctor':
            return Response({'error': 'Only doctors can update schedules.'}, status=403)
        try:
            doctor = request.user.doctor_profile
            for field in ['working_days', 'start_time', 'end_time', 'slot_duration', 'is_available']:
                if field in request.data:
                    setattr(doctor, field, request.data[field])
            doctor.save()
            return Response(DoctorSerializer(doctor).data)
        except Doctor.DoesNotExist:
            return Response({'error': 'Doctor profile not found.'}, status=404)


class MyDoctorProfileView(APIView):
    """Doctor: get own profile."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'doctor':
            return Response({'error': 'Not a doctor.'}, status=403)
        try:
            return Response(DoctorSerializer(request.user.doctor_profile).data)
        except Doctor.DoesNotExist:
            return Response({'error': 'Doctor profile not found.'}, status=404)