import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { Spinner } from '../../components/common/UIComponents'

export default function MedicalHistory() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date_of_birth: '', gender: '', blood_group: '',
    address: '', city: '', state: '', pincode: '',
    emergency_contact_name: '', emergency_contact_phone: '', known_allergies: '',
  })

  useEffect(() => {
    api.get('/patients/me/').then((r) => {
      setProfile(r.data)
      const p = r.data
      setForm({
        date_of_birth: p.date_of_birth || '',
        gender: p.gender || '',
        blood_group: p.blood_group || '',
        address: p.address || '',
        city: p.city || '',
        state: p.state || '',
        pincode: p.pincode || '',
        emergency_contact_name: p.emergency_contact_name || '',
        emergency_contact_phone: p.emergency_contact_phone || '',
        known_allergies: p.known_allergies || '',
      })
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.patch('/patients/me/', form)
      toast.success('Medical history updated.')
    } catch { toast.error('Failed.') }
    finally { setSaving(false) }
  }

  if (loading) return <Spinner />

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medical History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Patient ID: <span className="font-mono font-semibold text-primary-600">{profile?.patient_id}</span></p>
      </div>

      <div className="card">
        <form onSubmit={handleSave} className="space-y-5">
          <h3 className="font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date of Birth</label>
              <input type="date" className="input-field" value={form.date_of_birth} onChange={set('date_of_birth')} />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input-field" value={form.gender} onChange={set('gender')}>
                <option value="">Select</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Blood Group</label>
              <select className="input-field" value={form.blood_group} onChange={set('blood_group')}>
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <h3 className="font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 pt-2">Address</h3>
          <div>
            <label className="label">Street Address</label>
            <textarea className="input-field" rows={2} value={form.address} onChange={set('address')} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">City</label>
              <input className="input-field" value={form.city} onChange={set('city')} />
            </div>
            <div>
              <label className="label">State</label>
              <input className="input-field" value={form.state} onChange={set('state')} />
            </div>
            <div>
              <label className="label">Pincode</label>
              <input className="input-field" value={form.pincode} onChange={set('pincode')} />
            </div>
          </div>

          <h3 className="font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 pt-2">Emergency Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Name</label>
              <input className="input-field" value={form.emergency_contact_name} onChange={set('emergency_contact_name')} />
            </div>
            <div>
              <label className="label">Contact Phone</label>
              <input className="input-field" value={form.emergency_contact_phone} onChange={set('emergency_contact_phone')} />
            </div>
          </div>

          <div>
            <label className="label">Known Allergies</label>
            <textarea className="input-field" rows={3} placeholder="List any known allergies, medications to avoid..." value={form.known_allergies} onChange={set('known_allergies')} />
          </div>

          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Medical History'}</button>
        </form>
      </div>
    </div>
  )
}
