"""
Doctor model linked to User.
Stores specialization, experience, schedule, and department.
"""

from django.db import models
from apps.accounts.models import User
from apps.departments.models import Department


class Doctor(models.Model):
    DAYS_OF_WEEK = [
        ('MON', 'Monday'), ('TUE', 'Tuesday'), ('WED', 'Wednesday'),
        ('THU', 'Thursday'), ('FRI', 'Friday'), ('SAT', 'Saturday'), ('SUN', 'Sunday'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='doctors')
    specialization = models.CharField(max_length=200)
    qualification = models.CharField(max_length=200)
    experience_years = models.PositiveIntegerField(default=0)
    registration_number = models.CharField(max_length=50, unique=True)
    consultation_fee = models.DecimalField(max_digits=8, decimal_places=2, default=500.00)
    bio = models.TextField(blank=True)
    is_available = models.BooleanField(default=True)
    working_days = models.CharField(max_length=100, default='MON,TUE,WED,THU,FRI')
    start_time = models.TimeField(default='09:00')
    end_time = models.TimeField(default='17:00')
    slot_duration = models.PositiveIntegerField(default=30, help_text='Slot duration in minutes')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.specialization}"

    class Meta:
        db_table = 'doctors'
