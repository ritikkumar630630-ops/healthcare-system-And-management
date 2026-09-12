"""
Patient model.
Auto-generates a unique Patient ID in format PTYYYYNNNNN (e.g., PT20240001).
Supports OPD and IPD admission types.
"""

from django.db import models
from django.utils import timezone
from apps.accounts.models import User


def generate_patient_id():
    """Auto-generate Patient ID like PT20240001."""
    year = timezone.now().year
    prefix = f"PT{year}"
    last = Patient.objects.filter(patient_id__startswith=prefix).order_by('-patient_id').first()
    if last:
        num = int(last.patient_id[-4:]) + 1
    else:
        num = 1
    return f"{prefix}{num:04d}"


class Patient(models.Model):
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-'),
    ]
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    patient_id = models.CharField(max_length=20, unique=True, editable=False)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True)
    known_allergies = models.TextField(blank=True)
    medical_history_file = models.FileField(upload_to='medical_history/', blank=True, null=True)
    is_ipd = models.BooleanField(default=False, help_text='True if admitted (IPD)')
    ipd_admission_date = models.DateField(null=True, blank=True)
    ipd_ward = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.patient_id:
            self.patient_id = generate_patient_id()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.patient_id} - {self.user.get_full_name()}"

    @property
    def age(self):
        if self.date_of_birth:
            today = timezone.now().date()
            return (today - self.date_of_birth).days // 365
        return None

    class Meta:
        db_table = 'patients'
