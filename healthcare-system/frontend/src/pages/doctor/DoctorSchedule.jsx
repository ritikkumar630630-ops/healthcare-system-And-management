import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { Spinner } from '../../components/common/UIComponents'

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function DoctorSchedule() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ working_days: '', start_time: '', end_time: '', slot_duration: 30, is_available: true })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/doctors/me/').then((r) => {
      setProfile(r.data)
      const d = r.data
      setForm({
        working_days: d.working_days || 'MON,TUE,WED,THU,FRI',
        start_time: d.start_time || '09:00',
        end_time: d.end_time || '17:00',
        slot_duration: d.slot_duration || 30,
        is_available: d.is_available ?? true,
      })
    }).finally(() => setLoading(false))
  }, [])

  const toggleDay = (day) => {
    const current = form.working_days.split(',').filter(Boolean)
    const updated = current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
    setForm({ ...form, working_days: updated.join(',') })
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.patch('/doctors/schedule/update/', form)
      toast.success('Schedule updated.')
    } catch { toast.error('Failed to update.') }
    finally { setSaving(false) }
  }

  if (loading) return <Spinner />

  const activeDays = form.working_days.split(',').filter(Boolean)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Schedule</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your working days and consultation hours</p>
      </div>

      <div className="card">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="label mb-2">Available</label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-11 h-6 rounded-full transition-colors ${form.is_available ? 'bg-green-500' : 'bg-gray-300'}`} onClick={() => setForm({ ...form, is_available: !form.is_available })}>
                <div className={`w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${form.is_available ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{form.is_available ? 'Available for appointments' : 'Not available'}</span>
            </label>
          </div>

          <div>
            <label className="label mb-2">Working Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition ${activeDays.includes(day) ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Start Time</label>
              <input type="time" className="input-field" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            </div>
            <div>
              <label className="label">End Time</label>
              <input type="time" className="input-field" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            </div>
            <div>
              <label className="label">Slot (min)</label>
              <select className="input-field" value={form.slot_duration} onChange={(e) => setForm({ ...form, slot_duration: parseInt(e.target.value) })}>
                <option value={15}>15 min</option>
                <option value={20}>20 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Schedule'}</button>
        </form>
      </div>
    </div>
  )
}
