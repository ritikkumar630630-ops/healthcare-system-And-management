from rest_framework import serializers
from .models import Bill


class BillSerializer(serializers.ModelSerializer):
    total_amount = serializers.ReadOnlyField()
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Bill
        fields = [
            'id', 'appointment', 'patient', 'patient_name',
            'consultation_fee', 'medicine_charges', 'lab_charges',
            'other_charges', 'discount', 'total_amount', 'status', 'notes', 'created_at',
        ]
        read_only_fields = ['created_at']

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name()
