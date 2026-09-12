"""
Full dummy data seeder

HOW TO RUN (Windows):
    Step 1: Open CMD in your backend folder
    Step 2: python manage.py shell
    Step 3: Inside the shell, type:
            exec(open('bulk_seed.py').read())

Creates:
  - 10 Admin users
  - 100 Doctors (across 12 departments)
  - 1000 Patients
  - Appointments, Prescriptions, Bills for completed ones

LOGIN CREDENTIALS:
  Admin   -> username: admin            | password: Admin@123
  Doctors -> username: dr.first.last    | password: Doctor@123
  Patient -> username: first.last       | password: Patient@123
"""

from datetime import date, time, timedelta
from decimal import Decimal
import random

from apps.accounts.models import User
from apps.departments.models import Department
from apps.doctors.models import Doctor
from apps.patients.models import Patient
from apps.appointments.models import Appointment
from apps.prescriptions.models import Prescription
from apps.billing.models import Bill

random.seed(42)

# ─── Helper ──────────────────────────────────────────────────────────────────

def create_user(username, first, last, email, phone, role, password, approved=True):
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'first_name':   first,
            'last_name':    last,
            'email':        email,
            'phone':        phone,
            'role':         role,
            'is_approved':  approved,
            'is_staff':     role == 'admin',
            'is_superuser': role == 'admin',
        }
    )
    if created:
        user.set_password(password)
        user.save()
    return user, created

# ─── 1. Departments ──────────────────────────────────────────────────────────

DEPT_DATA = [
    ('Cardiology',       'Heart and cardiovascular diseases'),
    ('Neurology',        'Brain and nervous system disorders'),
    ('Orthopedics',      'Bone, joint and muscle conditions'),
    ('Pediatrics',       'Child health and development'),
    ('Gynecology',       "Women's reproductive health"),
    ('Dermatology',      'Skin, hair, and nail disorders'),
    ('Gastroenterology', 'Digestive system disorders'),
    ('Ophthalmology',    'Eye care and vision disorders'),
    ('ENT',              'Ear, Nose, and Throat disorders'),
    ('General Medicine', 'General health consultations'),
    ('Endocrinology',    'Hormonal and metabolic disorders'),
    ('Psychiatry',       'Mental health and behavioral disorders'),
]

depts = {}
for name, desc in DEPT_DATA:
    d, _ = Department.objects.get_or_create(name=name, defaults={'description': desc})
    depts[name] = d
print("Departments ready: %d" % len(depts))

# ─── 2. Admin Users ───────────────────────────────────────────────────────────

ADMINS = [
    ('admin',         'Hospital', 'Admin',   'admin@medicare.in',          '9000000000'),
    ('superadmin',    'Suresh',   'Nair',    'suresh.nair@medicare.in',    '9000000001'),
    ('admin.ops',     'Meera',    'Joshi',   'meera.joshi@medicare.in',    '9000000002'),
    ('admin.hr',      'Rakesh',   'Pandey',  'rakesh.pandey@medicare.in',  '9000000003'),
    ('admin.finance', 'Deepa',    'Menon',   'deepa.menon@medicare.in',    '9000000004'),
    ('admin.it',      'Arjun',    'Reddy',   'arjun.reddy@medicare.in',    '9000000005'),
    ('admin.lab',     'Sunita',   'Pillai',  'sunita.pillai@medicare.in',  '9000000006'),
    ('admin.pharm',   'Manoj',    'Tiwari',  'manoj.tiwari@medicare.in',   '9000000007'),
    ('admin.store',   'Kavya',    'Iyer',    'kavya.iyer@medicare.in',     '9000000008'),
    ('admin.ward',    'Pradeep',  'Sharma',  'pradeep.sharma@medicare.in', '9000000009'),
]

for uname, first, last, email, phone in ADMINS:
    u, c = create_user(uname, first, last, email, phone, 'admin', 'Admin@123')
    if c:
        print("  Admin created: %s" % uname)
print("Admin users done.")

# ─── 3. Doctors (100) ────────────────────────────────────────────────────────

DR_FIRST_NAMES = [
    'Rajesh', 'Priya', 'Amit', 'Sunita', 'Kavita', 'Mohammad', 'Lakshmi', 'Suresh',
    'Ananya', 'Vikram', 'Neha', 'Arjun', 'Deepa', 'Rahul', 'Meena', 'Sanjay',
    'Pooja', 'Kiran', 'Vivek', 'Nisha', 'Anil', 'Seema', 'Ravi', 'Geeta',
    'Manish', 'Aarti', 'Sandeep', 'Rekha', 'Gaurav', 'Shobha', 'Rohit', 'Swati',
    'Dinesh', 'Usha', 'Varun', 'Lata', 'Harish', 'Mona', 'Prakash', 'Radha',
    'Ashish', 'Jyoti', 'Nikhil', 'Meera', 'Sachin', 'Ritu', 'Tarun', 'Puja',
    'Ajay', 'Sonal', 'Mahesh', 'Divya', 'Rajan', 'Anjali', 'Vinod', 'Smita',
    'Kapil', 'Komal', 'Saurabh', 'Preeti', 'Mukesh', 'Asha', 'Pankaj', 'Nidhi',
    'Abhishek', 'Kaveri', 'Sumit', 'Pallavi', 'Hemant', 'Namita', 'Girish', 'Sarita',
    'Yash', 'Madhu', 'Tushar', 'Archana', 'Lokesh', 'Sonali', 'Chetan', 'Bharti',
    'Akash', 'Sarika', 'Deepak', 'Vandana', 'Jatin', 'Alka', 'Sunil', 'Shweta',
    'Dhanraj', 'Kamla', 'Lalit', 'Sudha', 'Naresh', 'Saroj', 'Ramesh', 'Poonam',
    'Bharat', 'Naina', 'Gopal', 'Ishita',
]

DR_LAST_NAMES = [
    'Sharma', 'Gupta', 'Patel', 'Singh', 'Verma', 'Khan', 'Iyer', 'Nair',
    'Roy', 'Mehta', 'Joshi', 'Mishra', 'Agarwal', 'Chopra', 'Rao', 'Reddy',
    'Pillai', 'Chaudhary', 'Banerjee', 'Mukherjee', 'Das', 'Desai', 'Shah',
    'Malhotra', 'Kapoor', 'Srivastava', 'Tiwari', 'Pandey', 'Saxena', 'Dubey',
    'Tripathi', 'Yadav', 'Jain', 'Dutta', 'Ghosh', 'Patil', 'Kulkarni', 'Naik',
    'Bose', 'Chatterjee', 'Bhatia', 'Arora', 'Sethi', 'Menon', 'Krishnan',
    'Subramaniam', 'Rajan', 'Mohan', 'Varma', 'Prasad',
]

DEPT_SPECS = {
    'Cardiology':       [('Cardiologist',                     'MBBS, MD (Cardiology), DM'),
                         ('Interventional Cardiologist',      'MBBS, MD, DM, FSCAI'),
                         ('Cardiac Electrophysiologist',      'MBBS, MD, DM (Cardiology)')],
    'Neurology':        [('Neurologist',                      'MBBS, MD, DM (Neurology)'),
                         ('Neuro-Surgeon',                    'MBBS, MS, MCh (Neuro Surgery)'),
                         ('Epileptologist',                   'MBBS, MD, DM (Neurology), Fellowship')],
    'Orthopedics':      [('Orthopedic Surgeon',               'MBBS, MS (Orthopedics)'),
                         ('Joint Replacement Surgeon',        'MBBS, MS, Fellowship (Joint)'),
                         ('Spine Surgeon',                    'MBBS, MS, MCh (Spine Surgery)')],
    'Pediatrics':       [('Pediatrician',                     'MBBS, MD (Pediatrics)'),
                         ('Neonatologist',                    'MBBS, MD, DM (Neonatology)'),
                         ('Pediatric Cardiologist',           'MBBS, MD, DM (Pediatric Cardiology)')],
    'Gynecology':       [('Gynecologist',                     'MBBS, MS (Obs and Gynecology)'),
                         ('Reproductive Medicine Specialist', 'MBBS, MD, Fellowship IVF'),
                         ('Maternal Fetal Medicine Specialist','MBBS, MS, DM (MFM)')],
    'Dermatology':      [('Dermatologist',                    'MBBS, MD (Dermatology)'),
                         ('Cosmetic Dermatologist',           'MBBS, MD, Fellowship Cosmetology'),
                         ('Trichologist',                     'MBBS, MD (Dermatology, Trichology)')],
    'Gastroenterology': [('Gastroenterologist',               'MBBS, MD, DM (Gastroenterology)'),
                         ('Hepatologist',                     'MBBS, MD, DM (Hepatology)'),
                         ('Colorectal Surgeon',               'MBBS, MS, MCh (Colorectal Surgery)')],
    'Ophthalmology':    [('Ophthalmologist',                  'MBBS, MS (Ophthalmology)'),
                         ('Retina Specialist',                'MBBS, MS, Fellowship (Retina)'),
                         ('Glaucoma Specialist',              'MBBS, MS, Fellowship (Glaucoma)')],
    'ENT':              [('ENT Specialist',                   'MBBS, MS (ENT)'),
                         ('Otologist',                        'MBBS, MS, Fellowship (Otology)'),
                         ('Head and Neck Surgeon',            'MBBS, MS, MCh (Head and Neck)')],
    'General Medicine': [('General Physician',                'MBBS, MD (General Medicine)'),
                         ('Internal Medicine Specialist',     'MBBS, MD, Fellowship IM'),
                         ('Hospitalist',                      'MBBS, MD (Internal Medicine)')],
    'Endocrinology':    [('Endocrinologist',                  'MBBS, MD, DM (Endocrinology)'),
                         ('Diabetologist',                    'MBBS, MD, Fellowship Diabetology'),
                         ('Thyroid Specialist',               'MBBS, MD, DM (Endocrinology)')],
    'Psychiatry':       [('Psychiatrist',                     'MBBS, MD (Psychiatry)'),
                         ('Child Psychiatrist',               'MBBS, MD, Fellowship Child Psychiatry'),
                         ('Addiction Psychiatrist',           'MBBS, MD (Psychiatry), Fellowship')],
}

WORKING_DAYS_OPTIONS = [
    'MON,TUE,WED,THU,FRI',
    'MON,WED,FRI',
    'TUE,THU,SAT',
    'MON,TUE,WED,THU,FRI,SAT',
    'MON,WED,FRI,SAT',
    'TUE,WED,THU',
]

FEE_RANGES = {
    'Cardiology':       (700,  1200),
    'Neurology':        (800,  1300),
    'Orthopedics':      (600,  1100),
    'Pediatrics':       (500,   900),
    'Gynecology':       (650,  1100),
    'Dermatology':      (550,   950),
    'Gastroenterology': (750,  1200),
    'Ophthalmology':    (500,   900),
    'ENT':              (450,   850),
    'General Medicine': (350,   700),
    'Endocrinology':    (700,  1150),
    'Psychiatry':       (600,  1000),
}

dept_names         = list(depts.keys())
doctors_per_dept   = {d: 8 for d in dept_names}
for i in range(4):
    doctors_per_dept[dept_names[i]] += 1  # 12x8 + 4 = 100 total

used_dr_usernames = set()
used_reg_numbers  = set()
doctor_objects    = []
dr_idx            = 0

for dept_name, count in doctors_per_dept.items():
    specs            = DEPT_SPECS[dept_name]
    fee_min, fee_max = FEE_RANGES[dept_name]

    for j in range(count):
        first = DR_FIRST_NAMES[dr_idx % len(DR_FIRST_NAMES)]
        last  = DR_LAST_NAMES[dr_idx % len(DR_LAST_NAMES)]

        base_uname = "dr.%s.%s" % (first.lower(), last.lower())
        uname  = base_uname
        suffix = 1
        while uname in used_dr_usernames or User.objects.filter(username=uname).exists():
            uname = "%s%d" % (base_uname, suffix)
            suffix += 1
        used_dr_usernames.add(uname)

        email   = "%s@medicare.in" % uname.replace('.', '_')
        phone   = "91%08d" % random.randint(10000000, 99999999)
        exp     = random.randint(3, 25)

        reg_year = 2024 - exp
        reg_base = "MCI-%d-%03d" % (reg_year, dr_idx + 1)
        reg      = reg_base
        r_suffix = 1
        while reg in used_reg_numbers or Doctor.objects.filter(registration_number=reg).exists():
            reg = "%s-%d" % (reg_base, r_suffix)
            r_suffix += 1
        used_reg_numbers.add(reg)

        spec, qual   = specs[j % len(specs)]
        fee          = Decimal(str(random.randint(fee_min // 50, fee_max // 50) * 50))
        working_days = random.choice(WORKING_DAYS_OPTIONS)
        start_h      = random.choice([8, 9, 10])
        end_h        = start_h + random.choice([7, 8])

        user, created = create_user(uname, first, last, email, phone, 'doctor', 'Doctor@123')
        doctor, _     = Doctor.objects.get_or_create(
            user=user,
            defaults={
                'department':          depts[dept_name],
                'specialization':      spec,
                'qualification':       qual,
                'experience_years':    exp,
                'registration_number': reg,
                'consultation_fee':    fee,
                'working_days':        working_days,
                'start_time':          time(start_h, 0),
                'end_time':            time(end_h, 0),
                'slot_duration':       30,
                'is_available':        True,
            }
        )
        doctor_objects.append(doctor)
        if created:
            print("  Doctor: Dr. %s %s | %s | login: %s / Doctor@123" % (first, last, dept_name, uname))
        dr_idx += 1

print("Doctors done: %d" % len(doctor_objects))

# ─── 4. Patients (1000) ──────────────────────────────────────────────────────

FIRST_NAMES = [
    'Aarav','Aditi','Ajay','Akash','Akshay','Amitabh','Ananya','Anil','Anjali','Ankit',
    'Ankita','Ansh','Anushka','Arjun','Aryan','Ashish','Ashok','Avni','Ayush','Bhavna',
    'Chetan','Deepak','Deepika','Dhruv','Divya','Gaurav','Geeta','Harish','Harsh','Heena',
    'Ishaan','Ishita','Jai','Jatin','Jyoti','Karan','Kavya','Kirti','Komal','Krishna',
    'Kunal','Lalit','Lata','Madhuri','Manish','Manisha','Meena','Mohan','Mohit','Mona',
    'Mukesh','Naman','Nandini','Naresh','Neha','Nikhil','Nikita','Nisha','Nitesh','Pallavi',
    'Pankaj','Payal','Pooja','Pradeep','Prakash','Prasad','Prateek','Priya','Puja','Rahul',
    'Raj','Rajesh','Rakesh','Ramesh','Ravi','Reena','Ritu','Rohit','Ruchi','Sachin',
    'Sanjay','Sanjana','Sanket','Sara','Seema','Shivam','Shreya','Shruti','Simran','Sneha',
    'Sonal','Sonam','Sunil','Suresh','Swati','Tarun','Usha','Varun','Vidya','Vikas',
    'Abhishek','Alok','Amish','Arnav','Avantika','Bharat','Chanda','Dhanraj','Ekta','Farhan',
    'Girish','Hema','Indira','Jagdish','Kamla','Lokesh','Madhav','Naina','Omkar','Prerna',
    'Rajan','Savita','Trilok','Uma','Vinay','Yamini','Zahra','Abhi','Bindu','Charu',
    'Dilip','Esha','Govind','Hemlata','Ishan','Jyotsna','Kalpana','Lavanya','Murali','Nalini',
]

LAST_NAMES = [
    'Agarwal','Ahuja','Arora','Banerjee','Bhatia','Bhatt','Chakraborty','Chaudhary',
    'Chawla','Chopra','Das','Desai','Deshpande','Dubey','Dutta','Garg','Ghosh','Gill',
    'Goyal','Gupta','Iyer','Jain','Jha','Joshi','Kapur','Kapoor','Khanna','Kothari',
    'Kumar','Malhotra','Mehta','Mishra','Mukherjee','Nair','Nanda','Pande','Pandey',
    'Patel','Patil','Pillai','Prasad','Rao','Rastogi','Reddy','Saxena','Seth','Shah',
    'Sharma','Shukla','Singh','Sinha','Srivastava','Tiwari','Tripathi','Varma','Verma','Yadav',
    'Bose','Chatterjee','Kulkarni','Naik','Menon','Krishnan','Subramaniam','Rajan',
    'Mohan','Sethi','Luthra','Bajaj','Choudhury','Dey','Grover','Hegde','Irani',
    'Juneja','Kaur','Lal','Malik','Negi','Oberoi','Punj','Qureshi','Rangarajan','Sood',
]

CITIES_STATES = [
    ('Mumbai','Maharashtra'),      ('Delhi','Delhi'),             ('Bangalore','Karnataka'),
    ('Chennai','Tamil Nadu'),      ('Kolkata','West Bengal'),     ('Hyderabad','Telangana'),
    ('Pune','Maharashtra'),        ('Jaipur','Rajasthan'),        ('Ahmedabad','Gujarat'),
    ('Lucknow','Uttar Pradesh'),   ('Bhopal','Madhya Pradesh'),   ('Patna','Bihar'),
    ('Indore','Madhya Pradesh'),   ('Nagpur','Maharashtra'),      ('Surat','Gujarat'),
    ('Coimbatore','Tamil Nadu'),   ('Kochi','Kerala'),            ('Chandigarh','Punjab'),
    ('Vadodara','Gujarat'),        ('Agra','Uttar Pradesh'),      ('Varanasi','Uttar Pradesh'),
    ('Meerut','Uttar Pradesh'),    ('Nashik','Maharashtra'),      ('Faridabad','Haryana'),
    ('Ghaziabad','Uttar Pradesh'), ('Rajkot','Gujarat'),          ('Amritsar','Punjab'),
    ('Allahabad','Uttar Pradesh'), ('Ranchi','Jharkhand'),        ('Guwahati','Assam'),
]

BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
GENDERS      = ['M','F','M','M','F']

patient_objects   = []
used_pt_usernames = set()

for i in range(1000):
    first = FIRST_NAMES[i % len(FIRST_NAMES)]
    last  = LAST_NAMES[i % len(LAST_NAMES)]

    base_uname = "%s.%s" % (first.lower(), last.lower())
    uname  = base_uname
    suffix = 1
    while uname in used_pt_usernames or User.objects.filter(username=uname).exists():
        uname = "%s%d" % (base_uname, suffix)
        suffix += 1
    used_pt_usernames.add(uname)

    email       = "%s@example.com" % uname
    phone       = "9%09d" % random.randint(100000000, 999999999)
    city, state = CITIES_STATES[i % len(CITIES_STATES)]
    gender      = GENDERS[i % len(GENDERS)]
    blood_group = BLOOD_GROUPS[i % len(BLOOD_GROUPS)]
    dob         = date(random.randint(1950, 2010), random.randint(1, 12), random.randint(1, 28))

    user, _ = create_user(uname, first, last, email, phone, 'patient', 'Patient@123')
    patient, _ = Patient.objects.get_or_create(
        user=user,
        defaults={
            'date_of_birth':           dob,
            'gender':                  gender,
            'blood_group':             blood_group,
            'city':                    city,
            'state':                   state,
            'pincode':                 str(random.randint(100000, 999999)),
            'address':                 "House No. %d, %s Colony" % (random.randint(1, 500), city),
            'emergency_contact_name':  "%s %s" % (FIRST_NAMES[(i + 5) % len(FIRST_NAMES)], last),
            'emergency_contact_phone': "8%09d" % random.randint(100000000, 999999999),
        }
    )
    patient_objects.append(patient)
    if (i + 1) % 100 == 0:
        print("  Patients so far: %d" % (i + 1))

print("Patients done: %d" % len(patient_objects))

# ─── 5. Appointments ─────────────────────────────────────────────────────────

REASONS = [
    'Routine checkup', 'Chest pain and breathlessness', 'Fever and body ache',
    'Persistent headache', 'Back pain', 'Skin rash and itching',
    'Stomach pain and acidity', 'Vision blurring', 'Joint pain and swelling',
    'Diabetes follow-up', 'Blood pressure monitoring', 'Anxiety and sleep issues',
    'Cough and cold', 'Ear pain', 'Menstrual irregularity', 'Weight gain concern',
    'Hair fall and scalp issue', 'Thyroid check', 'Eye redness and discharge',
    'Knee pain after exercise',
]

STATUSES = ['pending', 'approved', 'completed', 'completed', 'cancelled']

today        = date.today()
time_slots   = [time(h, m) for h in range(9, 17) for m in (0, 30)]
slot_tracker = {}
appointment_objects = []

for idx, patient in enumerate(patient_objects):
    num_appts = random.randint(1, 3)
    for _ in range(num_appts):
        doctor     = random.choice(doctor_objects)
        day_offset = random.randint(-60, 30)
        appt_date  = today + timedelta(days=day_offset)
        slot       = random.choice(time_slots)
        key        = (doctor.id, appt_date, slot)

        if key in slot_tracker:
            continue
        slot_tracker[key] = True

        status = random.choice(STATUSES)
        if appt_date > today and status == 'completed':
            status = 'approved'
        if appt_date > today and status == 'cancelled':
            status = 'pending'

        appt, created = Appointment.objects.get_or_create(
            doctor=doctor,
            appointment_date=appt_date,
            appointment_time=slot,
            defaults={
                'patient':          patient,
                'appointment_type': random.choice(['OPD', 'OPD', 'OPD', 'IPD']),
                'status':           status,
                'reason':           random.choice(REASONS),
            }
        )
        if created:
            appointment_objects.append(appt)

print("Appointments done: %d" % len(appointment_objects))

# ─── 6. Prescriptions + Bills ────────────────────────────────────────────────

DIAGNOSES = [
    'Essential Hypertension',
    'Type 2 Diabetes Mellitus',
    'Viral Upper Respiratory Tract Infection',
    'Migraine without aura',
    'Osteoarthritis of knee',
    'Allergic Dermatitis',
    'Gastroesophageal Reflux Disease (GERD)',
    'Anxiety Disorder',
    'Hypothyroidism',
    'Acute Pharyngitis',
    'Iron Deficiency Anemia',
    'Chronic Sinusitis',
    'Peptic Ulcer Disease',
    'Asthmatic Bronchitis',
    'Refractive Error (Myopia)',
]

MEDICINE_TEMPLATES = [
    "Tab. Amlodipine 5mg - Once daily after food\nTab. Aspirin 75mg - Once daily after food\nTab. Atorvastatin 10mg - Once at night",
    "Tab. Metformin 500mg - Twice daily after food\nTab. Glipizide 5mg - Once before breakfast\nCap. Vitamin D3 60K - Once weekly",
    "Tab. Paracetamol 650mg - Three times daily\nSyr. Ambroxol 15ml - Twice daily\nTab. Cetirizine 10mg - Once at night",
    "Tab. Sumatriptan 50mg - As needed for migraine\nTab. Propranolol 40mg - Twice daily\nTab. Domperidone 10mg - Before meals",
    "Tab. Diclofenac 50mg - Twice daily after food\nTab. Pantoprazole 40mg - Once before breakfast\nCap. Calcium + Vit D3 - Twice daily",
    "Cream Betamethasone 0.1% - Apply twice daily\nTab. Hydroxyzine 25mg - Once at night\nTab. Levocetirizine 5mg - Once daily",
    "Tab. Pantoprazole 40mg - Twice daily before food\nSyr. Antacid 10ml - After meals\nTab. Metoclopramide 10mg - Before meals",
    "Tab. Escitalopram 10mg - Once daily\nTab. Clonazepam 0.25mg - Once at night\nTab. Alprazolam 0.25mg - As needed",
    "Tab. Levothyroxine 50mcg - Once daily empty stomach\nCap. Vitamin B12 - Once daily\nTab. Calcium 500mg - Twice daily",
    "Tab. Amoxicillin 500mg - Three times daily\nTab. Paracetamol 500mg - Three times daily\nGargle with warm saline twice daily",
    "Tab. Ferrous Sulphate 200mg - Twice daily\nTab. Folic Acid 5mg - Once daily\nCap. Vitamin C 500mg - Once daily",
    "Tab. Amoxicillin-Clavulanate 625mg - Twice daily\nNasal Spray Fluticasone - Twice daily\nSteam Inhalation - Twice daily",
    "Tab. Pantoprazole 40mg - Once before breakfast\nTab. Amoxicillin 500mg - Twice daily\nTab. Clarithromycin 500mg - Twice daily",
    "Inhaler Salbutamol - As needed\nInhaler Budesonide - Twice daily\nTab. Montelukast 10mg - Once at night",
    "Eye Drops Tropicamide - As directed\nEye Drops Lubricant - Four times daily\nSpectacle prescription given",
]

BILL_NOTES = [
    'Paid via UPI', 'Paid via Cash', 'Paid via Card',
    'Insurance covered', 'Partial payment via insurance',
]

prescriptions_created = 0
bills_created         = 0
completed_appts       = [a for a in appointment_objects if a.status == 'completed']

for appt in completed_appts:
    idx = appt.id % len(DIAGNOSES)
    Prescription.objects.get_or_create(
        appointment=appt,
        defaults={
            'doctor':         appt.doctor,
            'patient':        appt.patient,
            'diagnosis':      DIAGNOSES[idx],
            'medicines':      MEDICINE_TEMPLATES[idx % len(MEDICINE_TEMPLATES)],
            'instructions':   'Take medicines on time. Avoid junk food. Stay hydrated. Follow up as scheduled.',
            'follow_up_date': appt.appointment_date + timedelta(days=random.choice([7, 14, 30])),
        }
    )
    prescriptions_created += 1

    Bill.objects.get_or_create(
        appointment=appt,
        defaults={
            'patient':          appt.patient,
            'consultation_fee': appt.doctor.consultation_fee,
            'medicine_charges': Decimal(str(random.choice([150, 250, 350, 450, 600]))),
            'lab_charges':      Decimal(str(random.choice([0, 200, 400, 600, 800]))),
            'other_charges':    Decimal(str(random.choice([0, 50, 100, 150]))),
            'discount':         Decimal('0'),
            'status':           random.choice(['paid', 'paid', 'unpaid']),
            'notes':            random.choice(BILL_NOTES),
        }
    )
    bills_created += 1

print("Prescriptions done: %d" % prescriptions_created)
print("Bills done: %d" % bills_created)

# ─── Summary ─────────────────────────────────────────────────────────────────

print("")
print("=" * 60)
print("  SEED COMPLETE")
print("=" * 60)
print("  Departments   : %d" % Department.objects.count())
print("  Admin users   : %d" % User.objects.filter(role='admin').count())
print("  Doctors       : %d" % Doctor.objects.count())
print("  Patients      : %d" % Patient.objects.count())
print("  Appointments  : %d" % Appointment.objects.count())
print("  Prescriptions : %d" % Prescription.objects.count())
print("  Bills         : %d" % Bill.objects.count())
print("=" * 60)
print("")
print("LOGIN CREDENTIALS")
print("  Admins   (password: Admin@123)")
print("    admin, superadmin, admin.ops, admin.hr, admin.finance ...")
print("")
print("  Doctors  (password: Doctor@123)")
print("    format: dr.<firstname>.<lastname>")
print("    e.g.   dr.rajesh.sharma, dr.priya.gupta, dr.amit.patel")
print("    Total: 100 doctors across 12 departments")
print("")
print("  Patients (password: Patient@123)")
print("    format: <firstname>.<lastname>  (or with number suffix)")
print("    e.g.   aarav.agarwal, aditi.ahuja, aarav.agarwal1")
print("    Total: 1000 patients")
print("=" * 60)