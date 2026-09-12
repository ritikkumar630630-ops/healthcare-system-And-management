from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from .models import Patient


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    age = serializers.ReadOnlyField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = [
            'id', 'user', 'full_name', 'patient_id', 'date_of_birth', 'age',
            'gender', 'blood_group', 'address', 'city', 'state', 'pincode',
            'emergency_contact_name', 'emergency_contact_phone',
            'known_allergies', 'medical_history_file',
            'is_ipd', 'ipd_admission_date', 'ipd_ward', 'created_at',
        ]
        read_only_fields = ['patient_id', 'created_at']

    def get_full_name(self, obj):
        return obj.user.get_full_name()


class PatientUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        exclude = ['user', 'patient_id', 'created_at']
