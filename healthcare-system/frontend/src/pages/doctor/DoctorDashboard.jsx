import { useState, useEffect } from 'react'
import { FiCalendar, FiClock, FiCheckCircle, FiUsers } from 'react-icons/fi'
import api from '../../services/api'
import { StatCard, Spinner, StatusBadge } from '../../components/common/UIComponents'

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/appointments/').then((r) => setAppointments(r.data.results || r.data)).finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter((a) => a.appointment_date === today)
  const pending = appointments.filter((a) => a.status === 'pending')
  const completed = appointments.filter((a) => a.status === 'completed')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your overview for today</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Appointments" value={appointments.length} icon={FiCalendar} color="blue" />
        <StatCard title="Today's Appointments" value={todayAppts.length} icon={FiClock} color="orange" />
        <StatCard title="Pending" value={pending.length} icon={FiUsers} color="purple" />
        <StatCard title="Completed" value={completed.length} icon={FiCheckCircle} color="green" />
      </div>

      {loading ? <Spinner /> : (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Today's Schedule ({today})</h3>
          {todayAppts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">No appointments scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {todayAppts.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{a.patient_name}</p>
                    <p className="text-xs text-gray-500">{a.appointment_time} — {a.appointment_type}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
