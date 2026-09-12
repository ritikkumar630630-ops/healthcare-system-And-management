import { useState, useEffect } from 'react'
import { FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { Spinner, EmptyState, StatusBadge } from '../../components/common/UIComponents'

const STATUS_OPTIONS = ['pending', 'approved', 'completed', 'cancelled']

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchAppts = () => {
    const params = statusFilter ? `?status=${statusFilter}` : ''
    api.get(`/appointments/${params}`)
      .then((r) => setAppointments(r.data.results || r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAppts() }, [statusFilter])

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/`, { status })
      toast.success(`Status updated to ${status}.`)
      fetchAppts()
    } catch { toast.error('Failed.') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Appointments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{appointments.length} records</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setStatusFilter('')} className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition ${!statusFilter ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>All</button>
          {STATUS_OPTIONS.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 text-sm rounded-lg border font-medium capitalize transition ${statusFilter === s ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['#', 'Patient', 'Doctor', 'Date', 'Time', 'Type', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {appointments.length === 0 ? (
                  <tr><td colSpan={8}><EmptyState message="No appointments found." /></td></tr>
                ) : appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">#{a.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{a.patient_name}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{a.doctor_name}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{a.appointment_date}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{a.appointment_time}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.appointment_type === 'IPD' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'}`}>{a.appointment_type}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3">
                      <select
                        value={a.status}
                        onChange={(e) => updateStatus(a.id, e.target.value)}
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-300"
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
