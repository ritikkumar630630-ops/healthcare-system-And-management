/**
 * Admin Dashboard — stats cards + appointments chart.
 */

import { useState, useEffect } from 'react'
import { FiUsers, FiCalendar, FiActivity, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../../services/api'
import { StatCard, Spinner } from '../../components/common/UIComponents'

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/appointments/dashboard/stats/')
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const pieData = [
    { name: 'Pending', value: stats.pending_appointments },
    { name: 'Approved', value: stats.approved_appointments },
    { name: 'Completed', value: stats.completed_appointments },
    { name: 'Cancelled', value: stats.cancelled_appointments },
  ]

  const barData = [
    { name: 'Patients', count: stats.total_patients },
    { name: 'Doctors', count: stats.total_doctors },
    { name: 'Total Appts', count: stats.total_appointments },
    { name: 'Completed', count: stats.completed_appointments },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Overview of the entire hospital system</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Patients" value={stats.total_patients} icon={FiActivity} color="blue" />
        <StatCard title="Total Doctors" value={stats.total_doctors} icon={FiUsers} color="green" />
        <StatCard title="Total Appointments" value={stats.total_appointments} icon={FiCalendar} color="purple" />
        <StatCard title="Pending" value={stats.pending_appointments} icon={FiClock} color="orange" />
        <StatCard title="Completed" value={stats.completed_appointments} icon={FiCheckCircle} color="green" />
        <StatCard title="Cancelled" value={stats.cancelled_appointments} icon={FiXCircle} color="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Hospital Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Appointment Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
