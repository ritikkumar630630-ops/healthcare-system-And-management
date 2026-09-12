/**
 * Admin: Manage Doctors
 * - List all doctors with search
 * - Add new doctor (creates User + Doctor profile in one step)
 * - Edit existing doctor profile
 * - Delete doctor
 * - Toggle approval (Active / Suspended)
 */

import { useState, useEffect } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiCheck, FiX, FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { Spinner, EmptyState, Modal } from '../../components/common/UIComponents'

const DAYS       = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const EMPTY_FORM = {
  // User fields
  first_name: '', last_name: '', email: '', phone: '', password: '',
  // Doctor fields
  specialization: '', qualification: '', experience_years: 0,
  registration_number: '', consultation_fee: 500,
  department: '', bio: '',
  working_days: 'MON,TUE,WED,THU,FRI',
  start_time: '09:00', end_time: '17:00', slot_duration: 30,
}

export default function ManageDoctors() {
  const [doctors, setDoctors]       = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editDoc, setEditDoc]       = useState(null)   // null = Add mode
  const [deleteId, setDeleteId]     = useState(null)
  const [deleting, setDeleting]     = useState(false)

  const fetchDoctors = () => {
    setLoading(true)
    api.get(`/doctors/?search=${search}`)
      .then((r) => setDoctors(r.data.results || r.data))
      .catch(() => toast.error('Failed to load doctors.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    api.get('/departments/').then((r) => setDepartments(r.data.results || r.data))
  }, [])

  useEffect(() => { fetchDoctors() }, [search])

  const handleToggleApproval = async (userId) => {
    try {
      const r = await api.post(`/auth/users/${userId}/toggle-approval/`)
      toast.success(`Doctor ${r.data.is_approved ? 'activated' : 'suspended'}.`)
      fetchDoctors()
    } catch {
      toast.error('Failed to update status.')
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/doctors/${deleteId}/`)
      toast.success('Doctor deleted.')
      setDeleteId(null)
      fetchDoctors()
    } catch {
      toast.error('Failed to delete. Doctor may have existing appointments.')
    } finally {
      setDeleting(false)
    }
  }

  const openAdd = () => { setEditDoc(null); setModalOpen(true) }
  const openEdit = (doc) => { setEditDoc(doc); setModalOpen(true) }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Doctors</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{doctors.length} doctors registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Doctor
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          className="input-field pl-10"
          placeholder="Search by name or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? <Spinner /> : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['Doctor', 'Specialization', 'Department', 'Fee', 'Exp.', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {doctors.length === 0 ? (
                  <tr><td colSpan={7}><EmptyState message="No doctors found." /></td></tr>
                ) : doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        Dr. {doc.user?.first_name} {doc.user?.last_name}
                      </div>
                      <div className="text-xs text-gray-400">{doc.user?.email}</div>
                      <div className="text-xs text-gray-400">{doc.user?.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{doc.specialization}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{doc.department?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">&#8377;{doc.consultation_fee}</td>
                    <td className="px-4 py-3 text-gray-500">{doc.experience_years}y</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        doc.user?.is_approved
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {doc.user?.is_approved ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Toggle approval */}
                        <button
                          onClick={() => handleToggleApproval(doc.user?.id)}
                          title={doc.user?.is_approved ? 'Suspend' : 'Activate'}
                          className={`p-1.5 rounded-lg transition ${
                            doc.user?.is_approved
                              ? 'hover:bg-red-50 text-red-500'
                              : 'hover:bg-green-50 text-green-600'
                          }`}
                        >
                          {doc.user?.is_approved ? <FiX size={15} /> : <FiCheck size={15} />}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEdit(doc)}
                          title="Edit"
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition"
                        >
                          <FiEdit size={15} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteId(doc.id)}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <DoctorFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        doctor={editDoc}
        departments={departments}
        onSaved={() => { setModalOpen(false); fetchDoctors() }}
      />

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Doctor">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this doctor? All their appointment history will be affected.
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── Add / Edit Modal ────────────────────────────────────────────────────────

function DoctorFormModal({ open, onClose, doctor, departments, onSaved }) {
  const isEdit = !!doctor
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [showPass, setShowPass]   = useState(false)
  const [activeDays, setActiveDays] = useState(['MON','TUE','WED','THU','FRI'])

  // Populate form when editing
  useEffect(() => {
    if (doctor) {
      setForm({
        first_name:          doctor.user?.first_name         || '',
        last_name:           doctor.user?.last_name          || '',
        email:               doctor.user?.email              || '',
        phone:               doctor.user?.phone              || '',
        password:            '',
        specialization:      doctor.specialization           || '',
        qualification:       doctor.qualification            || '',
        experience_years:    doctor.experience_years         || 0,
        registration_number: doctor.registration_number      || '',
        consultation_fee:    doctor.consultation_fee         || 500,
        department:          doctor.department?.id           || '',
        bio:                 doctor.bio                      || '',
        working_days:        doctor.working_days             || 'MON,TUE,WED,THU,FRI',
        start_time:          doctor.start_time               || '09:00',
        end_time:            doctor.end_time                 || '17:00',
        slot_duration:       doctor.slot_duration            || 30,
      })
      setActiveDays((doctor.working_days || 'MON,TUE,WED,THU,FRI').split(',').filter(Boolean))
    } else {
      setForm(EMPTY_FORM)
      setActiveDays(['MON','TUE','WED','THU','FRI'])
    }
  }, [doctor, open])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const toggleDay = (day) => {
    const updated = activeDays.includes(day)
      ? activeDays.filter((d) => d !== day)
      : [...activeDays, day]
    setActiveDays(updated)
    setForm((f) => ({ ...f, working_days: updated.join(',') }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.department) { toast.error('Please select a department.'); return }
    setSaving(true)

    try {
      if (isEdit) {
        // Edit: update doctor profile fields only
        const doctorPayload = {
          department:          form.department,
          specialization:      form.specialization,
          qualification:       form.qualification,
          experience_years:    form.experience_years,
          registration_number: form.registration_number,
          consultation_fee:    form.consultation_fee,
          bio:                 form.bio,
          working_days:        form.working_days,
          start_time:          form.start_time,
          end_time:            form.end_time,
          slot_duration:       form.slot_duration,
        }
        await api.patch(`/doctors/${doctor.id}/`, doctorPayload)
        toast.success('Doctor profile updated.')
      } else {
        // Add: create user + doctor in one call
        if (!form.password) { toast.error('Password is required.'); setSaving(false); return }
        const payload = {
          ...form,
          department: form.department,
        }
        await api.post('/doctors/add/', payload)
        toast.success('Doctor added successfully! They can now login.')
      }
      onSaved()
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const firstError = Object.values(data)[0]
        const msg = Array.isArray(firstError) ? firstError[0] : firstError
        toast.error(String(msg || 'Failed to save.'))
      } else {
        toast.error('Failed to save.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit — Dr. ${doctor?.user?.first_name} ${doctor?.user?.last_name}` : 'Add New Doctor'}
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">

        {/* ── Section: Personal Info (Add mode only shows all; Edit shows limited) ── */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Personal Information
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name *</label>
              <input
                className="input-field"
                placeholder="e.g. Rajesh"
                value={form.first_name}
                onChange={set('first_name')}
                required
                disabled={isEdit}
              />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input
                className="input-field"
                placeholder="e.g. Sharma"
                value={form.last_name}
                onChange={set('last_name')}
                required
                disabled={isEdit}
              />
            </div>
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                className="input-field"
                placeholder="doctor@hospital.com"
                value={form.email}
                onChange={set('email')}
                required
                disabled={isEdit}
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input-field"
                placeholder="9XXXXXXXXX"
                value={form.phone}
                onChange={set('phone')}
                maxLength={15}
              />
            </div>

            {/* Password only in Add mode */}
            {!isEdit && (
              <div className="col-span-2">
                <label className="label">Password *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={set('password')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Doctor will use this password to login. Username will be auto-generated from email.
                </p>
              </div>
            )}
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-600" />

        {/* ── Section: Professional Info ── */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Professional Information
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Specialization *</label>
              <input
                className="input-field"
                placeholder="e.g. Cardiologist"
                value={form.specialization}
                onChange={set('specialization')}
                required
              />
            </div>
            <div>
              <label className="label">Department *</label>
              <select
                className="input-field"
                value={form.department}
                onChange={set('department')}
                required
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Qualification</label>
              <input
                className="input-field"
                placeholder="e.g. MBBS, MD (Cardiology), DM"
                value={form.qualification}
                onChange={set('qualification')}
              />
            </div>
            <div>
              <label className="label">Registration No. *</label>
              <input
                className="input-field"
                placeholder="e.g. MCI-2015-001"
                value={form.registration_number}
                onChange={set('registration_number')}
                required
              />
            </div>
            <div>
              <label className="label">Experience (years)</label>
              <input
                type="number"
                className="input-field"
                min={0}
                value={form.experience_years}
                onChange={set('experience_years')}
              />
            </div>
            <div>
              <label className="label">Consultation Fee (&#8377;)</label>
              <input
                type="number"
                className="input-field"
                min={0}
                value={form.consultation_fee}
                onChange={set('consultation_fee')}
              />
            </div>
            <div>
              <label className="label">Slot Duration</label>
              <select
                className="input-field"
                value={form.slot_duration}
                onChange={(e) => setForm({ ...form, slot_duration: parseInt(e.target.value) })}
              >
                <option value={15}>15 min</option>
                <option value={20}>20 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Bio</label>
              <textarea
                className="input-field"
                rows={2}
                placeholder="Brief description about the doctor..."
                value={form.bio}
                onChange={set('bio')}
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-600" />

        {/* ── Section: Schedule ── */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Schedule
          </p>
          <div className="space-y-3">
            <div>
              <label className="label mb-2">Working Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                      activeDays.includes(day)
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Start Time</label>
                <input type="time" className="input-field" value={form.start_time} onChange={set('start_time')} />
              </div>
              <div>
                <label className="label">End Time</label>
                <input type="time" className="input-field" value={form.end_time} onChange={set('end_time')} />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2 sticky bottom-0 bg-white dark:bg-gray-800 pb-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving
              ? (isEdit ? 'Updating...' : 'Adding...')
              : (isEdit ? 'Update Doctor' : 'Add Doctor')
            }
          </button>
        </div>

      </form>
    </Modal>
  )
}