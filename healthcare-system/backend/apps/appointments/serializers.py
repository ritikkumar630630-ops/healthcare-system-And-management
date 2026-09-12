from rest_framework import serializers
from apps.doctors.serializers import DoctorSerializer
from apps.patients.serializers import PatientSerializer
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    patient_detail = PatientSerializer(source='patient', read_only=True)
    doctor_detail  = DoctorSerializer(source='doctor', read_only=True)
    patient_name   = serializers.SerializerMethodField()
    doctor_name    = serializers.SerializerMethodField()

    class Meta:
        model  = Appointment
        fields = [
            'id', 'patient', 'patient_detail', 'patient_name',
            'doctor', 'doctor_detail', 'doctor_name',
            'appointment_date', 'appointment_time', 'appointment_type',
            'status', 'reason', 'notes', 'created_at',
        ]
        read_only_fields = ['created_at']
        extra_kwargs = {
            # ✅ FIX: patient is auto-assigned in perform_create for patient role
            # so it must be optional here (not required in request body)
            'patient': {'required': False},
        }

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name()

    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name()}"

    def validate(self, attrs):
        doctor = attrs.get('doctor')
        date   = attrs.get('appointment_date')
        appt_time = attrs.get('appointment_time')

        if doctor and date and appt_time:
            qs = Appointment.objects.filter(
                doctor=doctor,
                appointment_date=date,
                appointment_time=appt_time,
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {'non_field_errors': ['This slot is already booked. Please choose another time.']}
                )
        return attrs


class AppointmentStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Appointment
        fields = ['status', 'notes']