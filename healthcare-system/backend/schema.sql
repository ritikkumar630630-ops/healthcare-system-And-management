-- PostgreSQL Schema for Smart Healthcare System
-- Run this AFTER Django migrations to see the auto-created structure.

-- Tables created by Django migrations:
-- users, departments, doctors, patients,
-- appointments, prescriptions, bills

-- Useful views and indexes:

-- Index for fast appointment lookups by doctor & date
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments (doctor_id, appointment_date);

-- Index for patient ID search
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients (patient_id);

-- View: Today's appointments
CREATE OR REPLACE VIEW today_appointments AS
SELECT
    a.id,
    u_p.first_name || ' ' || u_p.last_name AS patient_name,
    p.patient_id,
    'Dr. ' || u_d.first_name || ' ' || u_d.last_name AS doctor_name,
    d_dept.name AS department,
    a.appointment_time,
    a.appointment_type,
    a.status
FROM appointments a
JOIN patients p ON p.id = a.patient_id
JOIN users u_p ON u_p.id = p.user_id
JOIN doctors d ON d.id = a.doctor_id
JOIN users u_d ON u_d.id = d.user_id
JOIN departments d_dept ON d_dept.id = d.department_id
WHERE a.appointment_date = CURRENT_DATE
ORDER BY a.appointment_time;

-- View: Revenue summary per doctor
CREATE OR REPLACE VIEW doctor_revenue AS
SELECT
    'Dr. ' || u.first_name || ' ' || u.last_name AS doctor_name,
    dept.name AS department,
    COUNT(b.id) AS total_bills,
    SUM(b.consultation_fee + b.medicine_charges + b.lab_charges + b.other_charges - b.discount) AS total_revenue
FROM bills b
JOIN appointments a ON a.id = b.appointment_id
JOIN doctors d ON d.id = a.doctor_id
JOIN users u ON u.id = d.user_id
JOIN departments dept ON dept.id = d.department_id
WHERE b.status = 'paid'
GROUP BY u.first_name, u.last_name, dept.name
ORDER BY total_revenue DESC;
