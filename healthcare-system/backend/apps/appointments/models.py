"""
Appointment model.
Slot-based booking system with OPD/IPD type.
Status: pending -> approved -> completed / cancelled
"""

from django.db import models
from apps.accounts.models import User
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    TYPE_CHOICES = [
        ('OPD', 'Out-Patient (OPD)'),
        ('IPD', 'In-Patient (IPD)'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    appointment_type = models.CharField(max_length=5, choices=TYPE_CHOICES, default='OPD')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    reason = models.TextField(blank=True, help_text='Reason for visit')
    notes = models.TextField(blank=True, help_text='Doctor notes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Appt #{self.id} - {self.patient} with Dr.{self.doctor.user.last_name} on {self.appointment_date}"

    class Meta:
        db_table = 'appointments'
        ordering = ['-appointment_date', '-appointment_time']
        # Prevent double booking
        unique_together = ['doctor', 'appointment_date', 'appointment_time']
