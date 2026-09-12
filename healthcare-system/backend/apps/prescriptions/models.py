"""Prescription model — doctor adds prescriptions for a patient's appointment."""

from django.db import models
from apps.appointments.models import Appointment
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class Prescription(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='prescription')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='prescriptions')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    diagnosis = models.TextField()
    medicines = models.TextField(help_text='List medicines one per line')
    instructions = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    report_file = models.FileField(upload_to='reports/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prescription #{self.id} for {self.patient}"

    class Meta:
        db_table = 'prescriptions'
        ordering = ['-created_at']
