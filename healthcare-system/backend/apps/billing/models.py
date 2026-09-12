"""Basic billing model for Indian hospital OPD/IPD invoices."""

from django.db import models
from apps.appointments.models import Appointment
from apps.patients.models import Patient


class Bill(models.Model):
    STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('partial', 'Partial'),
    ]

    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='bill')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='bills')
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    medicine_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    lab_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='unpaid')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def total_amount(self):
        return (
            self.consultation_fee + self.medicine_charges +
            self.lab_charges + self.other_charges - self.discount
        )

    def __str__(self):
        return f"Bill #{self.id} - {self.patient} - Rs.{self.total_amount}"

    class Meta:
        db_table = 'bills'
        ordering = ['-created_at']
