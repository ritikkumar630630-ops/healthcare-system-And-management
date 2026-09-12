from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from apps.departments.serializers import DepartmentSerializer
from .models import Doctor


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__('apps.departments.models', fromlist=['Department']).Department.objects.all(),
        source='department', write_only=True
    )
    full_name = serializers.SerializerMethodField()
"""
doctors/serializers.py
Full serializers for Doctor management.
AdminCreateDoctorSerializer creates User + Doctor profile in one API call.
"""

from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from apps.departments.serializers import DepartmentSerializer
from apps.accounts.models import User
from .models import Doctor


class DoctorSerializer(serializers.ModelSerializer):
    user       = UserSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__('apps.departments.models', fromlist=['Department']).Department.objects.all(),
        source='department', write_only=True, required=False, allow_null=True
    )
    full_name = serializers.SerializerMethodField()

    class Meta:
        model  = Doctor
        fields = [
            'id', 'user', 'full_name', 'department', 'department_id',
            'specialization', 'qualification', 'experience_years',
            'registration_number', 'consultation_fee', 'bio',
            'is_available', 'working_days', 'start_time', 'end_time',
            'slot_duration', 'created_at',
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name()


class DoctorCreateSerializer(serializers.ModelSerializer):
    """Used for PATCH/PUT on existing doctor profile."""

    class Meta:
        model  = Doctor
        fields = [
            'user', 'department', 'specialization', 'qualification',
            'experience_years', 'registration_number', 'consultation_fee',
            'bio', 'working_days', 'start_time', 'end_time', 'slot_duration',
        ]


class AdminCreateDoctorSerializer(serializers.Serializer):
    """
    Admin creates a doctor in one step:
    - Creates a User with role='doctor'
    - Creates the Doctor profile linked to that user
    """

    # ── User fields ───────────────────────────────────────────────────────
    first_name = serializers.CharField(max_length=150)
    last_name  = serializers.CharField(max_length=150)
    email      = serializers.EmailField()
    phone      = serializers.CharField(max_length=15, required=False, allow_blank=True)
    password   = serializers.CharField(write_only=True, min_length=6)

    # ── Doctor profile fields ─────────────────────────────────────────────
    department          = serializers.PrimaryKeyRelatedField(
        queryset=__import__('apps.departments.models', fromlist=['Department']).Department.objects.all(),
        required=False, allow_null=True
    )
    specialization      = serializers.CharField(max_length=200)
    qualification       = serializers.CharField(max_length=200, required=False, allow_blank=True)
    experience_years    = serializers.IntegerField(default=0, min_value=0)
    registration_number = serializers.CharField(max_length=50)
    consultation_fee    = serializers.DecimalField(max_digits=8, decimal_places=2, default=500)
    bio                 = serializers.CharField(required=False, allow_blank=True)
    working_days        = serializers.CharField(max_length=100, default='MON,TUE,WED,THU,FRI')
    start_time          = serializers.TimeField(default='09:00')
    end_time            = serializers.TimeField(default='17:00')
    slot_duration       = serializers.IntegerField(default=30)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_registration_number(self, value):
        if Doctor.objects.filter(registration_number=value).exists():
            raise serializers.ValidationError("This registration number is already in use.")
        return value

    def create(self, validated_data):
        # Split user fields from doctor fields
        user_fields   = ['first_name', 'last_name', 'email', 'phone', 'password']
        doctor_fields = ['department', 'specialization', 'qualification',
                         'experience_years', 'registration_number', 'consultation_fee',
                         'bio', 'working_days', 'start_time', 'end_time', 'slot_duration']

        user_data   = {k: validated_data[k] for k in user_fields if k in validated_data}
        doctor_data = {k: validated_data[k] for k in doctor_fields if k in validated_data}

        # Auto-generate username from email prefix, ensure uniqueness
        base_username = user_data['email'].split('@')[0].replace('.', '_').lower()
        username      = base_username
        suffix        = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{suffix}"
            suffix  += 1

        password = user_data.pop('password')
        user = User(
            username   = username,
            role       = 'doctor',
            is_approved= True,
            **user_data
        )
        user.set_password(password)
        user.save()

        doctor = Doctor.objects.create(user=user, **doctor_data)
        return doctor
    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'full_name', 'department', 'department_id',
            'specialization', 'qualification', 'experience_years',
            'registration_number', 'consultation_fee', 'bio',
            'is_available', 'working_days', 'start_time', 'end_time',
            'slot_duration', 'created_at',
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name()


class DoctorCreateSerializer(serializers.ModelSerializer):
    """Used when admin creates a doctor profile for an existing user."""

    class Meta:
        model = Doctor
        fields = [
            'user', 'department', 'specialization', 'qualification',
            'experience_years', 'registration_number', 'consultation_fee',
            'bio', 'working_days', 'start_time', 'end_time', 'slot_duration',
        ]
