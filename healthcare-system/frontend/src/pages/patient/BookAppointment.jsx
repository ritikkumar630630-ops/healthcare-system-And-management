/**
 * Book Appointment — choose department -> doctor -> date -> time slot.
 * FIX: Removed `user.patient_id` from POST body.
 *      Backend auto-assigns patient from logged-in user in perform_create.
 */

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { Spinner } from '../../components/common/UIComponents'

export default function BookAppointment() {
  const [step, setStep] = useState(1) // 1:dept, 2:doctor, 3:datetime, 4:confirm
  const [departments, setDepartments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)

  const [selectedDept, setSelectedDept] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [form, setForm] = useState({ appointment_type: 'OPD', reason: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get('/departments/').then((r) => setDepartments(r.data.results || r.data))
  }, [])

  const handleSelectDept = async (dept) => {
    setSelectedDept(dept)
    setLoading(true)
    const r = await api.get(`/doctors/?department=${dept.id}`)
    setDoctors(r.data.results || r.data)
    setLoading(false)
    setStep(2)
  }

  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc)
    setStep(3)
  }

  const handleDateChange = async (date) => {
    setSelectedDate(date)
    setSelectedSlot('')
    if (!date || !selectedDoctor) return
    setLoading(true)
    try {
      const r = await api.get(`/appointments/slots/?doctor_id=${selectedDoctor.id}&date=${date}`)
      setSlots(r.data.available_slots || [])
    } catch {
      toast.error('Failed to load slots.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedSlot) { toast.error('Please select a time slot.'); return }
    setSubmitting(true)
    try {
      // ✅ FIX: Do NOT send `patient` field.
      // Backend's perform_create() auto-assigns patient from request.user
      await api.post('/appointments/', {
        doctor: selectedDoctor.id,
        appointment_date: selectedDate,
        appointment_time: selectedSlot,
        appointment_type: form.appointment_type,
        reason: form.reason,
      })
      toast.success('Appointment booked successfully!')
      setStep(1)
      setSelectedDept(null)
      setSelectedDoctor(null)
      setSelectedDate('')
      setSelectedSlot('')
      setForm({ appointment_type: 'OPD', reason: '' })
    } catch (err) {
      const errData = err.response?.data
      const msg =
        errData?.non_field_errors?.[0] ||
        errData?.detail ||
        errData?.doctor?.[0] ||
        'Booking failed. Please try again.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book Appointment</h1>
        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-3">
          {['Department', 'Doctor', 'Date & Time', 'Confirm'].map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step > i + 1
                  ? 'bg-green-500 text-white'
                  : step === i + 1
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              }`}>
                {i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${step === i + 1 ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>
                {s}
              </span>
              {i < 3 && <div className="w-6 h-px bg-gray-300 dark:bg-gray-600 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Department */}
      {step === 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => handleSelectDept(d)}
              className="card text-center hover:border-primary-500 hover:shadow-md transition cursor-pointer border-2 border-transparent"
            >
              <div className="text-4xl mb-2">{d.icon}</div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{d.name}</p>
              <p className="text-xs text-gray-500 mt-1">{d.doctor_count} doctors</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Doctor */}
      {step === 2 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(1)} className="text-sm text-primary-600 hover:underline">
              &larr; Back
            </button>
            <span className="text-sm text-gray-500">
              Department: <strong>{selectedDept?.name}</strong>
            </span>
          </div>
          {loading ? (
            <Spinner />
          ) : doctors.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No doctors available in this department.</p>
          ) : (
            doctors.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleSelectDoctor(doc)}
                className="card w-full text-left hover:border-primary-500 hover:shadow-md transition border-2 border-transparent"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center font-bold text-primary-700 dark:text-primary-300">
                    {doc.user?.first_name?.[0]}{doc.user?.last_name?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Dr. {doc.user?.first_name} {doc.user?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {doc.specialization} &bull; {doc.experience_years}y exp
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{doc.qualification}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">&#8377;{doc.consultation_fee}</p>
                    <p className="text-xs text-gray-500">per visit</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Step 3: Date & Slot */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(2)} className="text-sm text-primary-600 hover:underline">
              &larr; Back
            </button>
            <span className="text-sm text-gray-500">
              Dr. {selectedDoctor?.user?.first_name} {selectedDoctor?.user?.last_name}
            </span>
          </div>
          <div className="card space-y-4">
            <div>
              <label className="label">Select Date</label>
              <input
                type="date"
                className="input-field max-w-xs"
                min={today}
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>
            {loading && <Spinner />}
            {selectedDate && !loading && (
              <div>
                <label className="label">Available Time Slots</label>
                {slots.length === 0 ? (
                  <p className="text-sm text-gray-500">No slots available for this date.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition ${
                          selectedSlot === slot
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Visit Type</label>
                <select
                  className="input-field"
                  value={form.appointment_type}
                  onChange={(e) => setForm({ ...form, appointment_type: e.target.value })}
                >
                  <option value="OPD">OPD (Out-Patient)</option>
                  <option value="IPD">IPD (In-Patient)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Reason for Visit</label>
              <textarea
                className="input-field"
                rows={2}
                placeholder="Briefly describe your symptoms or reason..."
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
            <button
              onClick={() => {
                if (selectedDate && selectedSlot) setStep(4)
                else toast.error('Select date and time slot.')
              }}
              className="btn-primary"
            >
              Continue to Confirm
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Confirm Appointment</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-2 text-sm">
            <Row label="Doctor" value={`Dr. ${selectedDoctor?.user?.first_name} ${selectedDoctor?.user?.last_name}`} />
            <Row label="Specialization" value={selectedDoctor?.specialization} />
            <Row label="Department" value={selectedDept?.name} />
            <Row label="Date" value={selectedDate} />
            <Row label="Time" value={selectedSlot} />
            <Row label="Type" value={form.appointment_type} />
            <Row label="Fee" value={`\u20B9${selectedDoctor?.consultation_fee}`} />
            {form.reason && <Row label="Reason" value={form.reason} />}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="btn-secondary flex-1">
              &larr; Edit
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Booking...' : 'Confirm & Book'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}