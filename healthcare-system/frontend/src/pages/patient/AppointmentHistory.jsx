import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { Spinner, EmptyState, StatusBadge } from '../../components/common/UIComponents'

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    const params = filter ? `?status=${filter}` : ''
    api.get(`/appointments/${params}`).then((r) => setAppointments(r.data.results || r.data)).finally(() => setLoading(false))
  }, [filter])

  const cancelAppt = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    try { await api.patch(`/appointments/${id}/`, { status: 'cancelled' }); toast.success('Appointment cancelled.'); setLoading(true); api.get('/appointments/').then((r) => { setAppointments(r.data.results || r.data); setLoading(false) }) }
    catch { toast.error('Failed.') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
        <div className="flex gap-2">
          {['', 'pending', 'approved', 'completed', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-xs rounded-lg border font-medium capitalize transition ${filter === s ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>{s || 'All'}</button>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : appointments.length === 0 ? <EmptyState message="No appointments found." /> : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{a.doctor_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{a.appointment_date} at {a.appointment_time}</p>
                  {a.reason && <p className="text-xs text-gray-500 mt-1">Reason: {a.reason}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={a.status} />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.appointment_type === 'IPD' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'}`}>{a.appointment_type}</span>
                </div>
              </div>
              {a.notes && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Doctor's Notes:</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-0.5">{a.notes}</p>
                </div>
              )}
              {['pending', 'approved'].includes(a.status) && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button onClick={() => cancelAppt(a.id)} className="text-xs text-red-600 hover:underline">Cancel Appointment</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
