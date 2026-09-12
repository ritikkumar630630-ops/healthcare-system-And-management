from rest_framework import serializers
from .models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    doctor_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'icon', 'is_active', 'doctor_count', 'created_at']

    def get_doctor_count(self, obj):
        return obj.doctors.filter(is_available=True).count()
