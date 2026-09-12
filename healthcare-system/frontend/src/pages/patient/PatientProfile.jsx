/**
 * Patient Profile Page
 * - View & edit personal info (name, phone, DOB, blood group, address, etc.)
 * - Change password
 * Route: /patient/profile
 */

import { useState, useEffect } from 'react'
import { FiUser, FiLock, FiEdit2, FiSave, FiX, FiEye, FiEyeOff, FiPhone, FiMail, FiMapPin, FiCalendar, FiHeart, FiAlertCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { Spinner } from '../../components/common/UIComponents'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const GENDERS      = [{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: 'O', label: 'Other' }]

export default function PatientProfile() {
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('profile') // 'profile' | 'password'
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({})

  // Password form
  const [pwForm, setPwForm]     = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [showPw, setShowPw]     = useState({ old: false, new: false, confirm: false })
  const [savingPw, setSavingPw] = useState(false)

  const fetchProfile = () => {
    api.get('/patients/me/')
      .then((r) => {
        setProfile(r.data)
        setForm({
          // User fields (via /auth/profile/)
          first_name: r.data.user?.first_name || '',
          last_name:  r.data.user?.last_name  || '',
          phone:      r.data.user?.phone      || '',
          // Patient fields
          date_of_birth:           r.data.date_of_birth           || '',
          gender:                  r.data.gender                  || '',
          blood_group:             r.data.blood_group             || '',
          address:                 r.data.address                 || '',
          city:                    r.data.city                    || '',
          state:                   r.data.state                   || '',
          pincode:                 r.data.pincode                 || '',
          emergency_contact_name:  r.data.emergency_contact_name  || '',
          emergency_contact_phone: r.data.emergency_contact_phone || '',
          known_allergies:         r.data.known_allergies         || '',
        })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProfile() }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Update user fields (first_name, last_name, phone)
      await api.patch('/auth/profile/', {
        first_name: form.first_name,
        last_name:  form.last_name,
        phone:      form.phone,
      })
      // Update patient fields
      await api.patch('/patients/me/', {
        date_of_birth:           form.date_of_birth,
        gender:                  form.gender,
        blood_group:             form.blood_group,
        address:                 form.address,
        city:                    form.city,
        state:                   form.state,
        pincode:                 form.pincode,
        emergency_contact_name:  form.emergency_contact_name,
        emergency_contact_phone: form.emergency_contact_phone,
        known_allergies:         form.known_allergies,
      })
      toast.success('Profile updated successfully.')
      setEditing(false)
      fetchProfile()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update profile.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error('New passwords do not match.')
      return
    }
    if (pwForm.new_password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    setSavingPw(true)
    try {
      await api.post('/auth/change-password/', {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      })
      toast.success('Password changed successfully.')
      setPwForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to change password.'
      toast.error(msg)
    } finally {
      setSavingPw(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-2xl font-bold text-primary-700 dark:text-primary-300">
          {profile?.user?.first_name?.[0]}{profile?.user?.last_name?.[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {profile?.user?.first_name} {profile?.user?.last_name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Patient ID:&nbsp;
            <span className="font-mono font-semibold text-primary-600">{profile?.patient_id}</span>
          </p>
          <p className="text-xs text-gray-400">{profile?.user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1 w-fit">
        {[
          { id: 'profile',  label: 'My Profile',       icon: FiUser },
          { id: 'password', label: 'Change Password',  icon: FiLock },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
              tab === t.id
                ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Profile ─────────────────────────────────────────────────── */}
      {tab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-5">

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Blood Group', value: profile?.blood_group || '—',         color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-900/20'     },
              { label: 'Age',         value: profile?.age ? `${profile.age} yrs` : '—', color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20'   },
              { label: 'Gender',      value: profile?.gender === 'M' ? 'Male' : profile?.gender === 'F' ? 'Female' : profile?.gender || '—',
                                                                                   color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { label: 'City',        value: profile?.city || '—',                color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20'   },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl p-3 ${s.bg}`}>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="card space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiUser size={16} className="text-primary-500" /> Personal Information
              </h2>
              {!editing ? (
                <button type="button" onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium">
                  <FiEdit2 size={14} /> Edit
                </button>
              ) : (
                <button type="button" onClick={() => { setEditing(false); fetchProfile() }}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                  <FiX size={14} /> Cancel
                </button>
              )}
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" icon={FiUser} disabled={!editing}
                value={form.first_name} onChange={set('first_name')} placeholder="First name" />
              <Field label="Last Name"  icon={FiUser} disabled={!editing}
                value={form.last_name}  onChange={set('last_name')}  placeholder="Last name" />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Email</label>
                <div className="input-field bg-gray-50 dark:bg-gray-700 text-gray-400 cursor-not-allowed flex items-center gap-2">
                  <FiMail size={14} className="flex-shrink-0" />
                  {profile?.user?.email}
                </div>
              </div>
              <Field label="Phone" icon={FiPhone} disabled={!editing}
                value={form.phone} onChange={set('phone')} placeholder="9XXXXXXXXX" />
            </div>

            {/* DOB, Gender, Blood Group */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label flex items-center gap-1"><FiCalendar size={12}/> Date of Birth</label>
                <input type="date" className="input-field disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-700"
                  disabled={!editing} value={form.date_of_birth} onChange={set('date_of_birth')} />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input-field disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-700"
                  disabled={!editing} value={form.gender} onChange={set('gender')}>
                  <option value="">Select</option>
                  {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label flex items-center gap-1"><FiHeart size={12}/> Blood Group</label>
                <select className="input-field disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-700"
                  disabled={!editing} value={form.blood_group} onChange={set('blood_group')}>
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-600" />

            {/* Address */}
            <div>
              <label className="label flex items-center gap-1"><FiMapPin size={12}/> Address</label>
              <textarea className="input-field disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-700"
                rows={2} disabled={!editing} value={form.address}
                onChange={set('address')} placeholder="House No, Street, Colony" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="City"    disabled={!editing} value={form.city}    onChange={set('city')}    placeholder="Mumbai" />
              <Field label="State"   disabled={!editing} value={form.state}   onChange={set('state')}   placeholder="Maharashtra" />
              <Field label="Pincode" disabled={!editing} value={form.pincode} onChange={set('pincode')} placeholder="400001" />
            </div>

            <hr className="border-gray-200 dark:border-gray-600" />

            {/* Emergency Contact */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Emergency Contact</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Contact Name"  disabled={!editing}
                  value={form.emergency_contact_name}  onChange={set('emergency_contact_name')}  placeholder="Full name" />
                <Field label="Contact Phone" disabled={!editing}
                  value={form.emergency_contact_phone} onChange={set('emergency_contact_phone')} placeholder="Phone number" />
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="label flex items-center gap-1"><FiAlertCircle size={12}/> Known Allergies</label>
              <textarea className="input-field disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-700"
                rows={2} disabled={!editing} value={form.known_allergies}
                onChange={set('known_allergies')} placeholder="e.g. Penicillin, Sulfa drugs, Pollen" />
            </div>

            {/* Save button */}
            {editing && (
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setEditing(false); fetchProfile() }} className="btn-secondary flex-1">
                  <FiX size={14} className="mr-1" /> Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  <FiSave size={14} className="mr-1" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </form>
      )}

      {/* ── TAB: Change Password ──────────────────────────────────────────── */}
      {tab === 'password' && (
        <form onSubmit={handleChangePassword} className="card space-y-5 max-w-md">
          <div className="flex items-center gap-2">
            <FiLock size={18} className="text-primary-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Change Password</h2>
          </div>

          <PasswordField
            label="Current Password"
            value={pwForm.old_password}
            show={showPw.old}
            onToggle={() => setShowPw((p) => ({ ...p, old: !p.old }))}
            onChange={(e) => setPwForm((f) => ({ ...f, old_password: e.target.value }))}
            placeholder="Enter current password"
          />
          <PasswordField
            label="New Password"
            value={pwForm.new_password}
            show={showPw.new}
            onToggle={() => setShowPw((p) => ({ ...p, new: !p.new }))}
            onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))}
            placeholder="Min 6 characters"
          />
          <PasswordField
            label="Confirm New Password"
            value={pwForm.confirm_password}
            show={showPw.confirm}
            onToggle={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}
            onChange={(e) => setPwForm((f) => ({ ...f, confirm_password: e.target.value }))}
            placeholder="Repeat new password"
          />

          {/* Match indicator */}
          {pwForm.new_password && pwForm.confirm_password && (
            <p className={`text-xs font-medium ${pwForm.new_password === pwForm.confirm_password ? 'text-green-600' : 'text-red-500'}`}>
              {pwForm.new_password === pwForm.confirm_password ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}

          <button type="submit" disabled={savingPw} className="btn-primary w-full">
            <FiLock size={14} className="mr-2" />
            {savingPw ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  )
}

// ─── Small reusable components ───────────────────────────────────────────────

function Field({ label, icon: Icon, disabled, value, onChange, placeholder }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
        <input
          className={`input-field ${Icon ? 'pl-8' : ''} disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:disabled:text-gray-400`}
          disabled={disabled}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}

function PasswordField({ label, value, show, onToggle, onChange, placeholder }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={show ? 'text' : 'password'}
          className="input-field pl-8 pr-10"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
        />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
        </button>
      </div>
    </div>
  )
}