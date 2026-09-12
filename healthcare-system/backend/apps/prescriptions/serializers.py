from rest_framework import serializers
from .models import Prescription


class PrescriptionSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = [
            'id', 'appointment', 'doctor', 'doctor_name', 'patient', 'patient_name',
            'diagnosis', 'medicines', 'instructions', 'follow_up_date',
            'report_file', 'created_at',
        ]
        read_only_fields = ['created_at']

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name()

    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name()}"
