/**
 * Patient Dashboard — with profile summary card and quick actions.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiCalendar, FiFileText, FiHeart, FiMessageSquare, FiUser } from 'react-icons/fi'
import api from '../../services/api'
import { Spinner, StatusBadge } from '../../components/common/UIComponents'

export default function PatientDashboard() {
  const [profile, setProfile]           = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/patients/me/'),
      api.get('/appointments/'),
    ]).then(([pRes, aRes]) => {
      setProfile(pRes.data)
      setAppointments(aRes.data.results || aRes.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const upcoming  = appointments.filter((a) => ['pending', 'approved'].includes(a.status))
  const completed = appointments.filter((a) => a.status === 'completed')

  return (
    <div className="space-y-6">

      {/* Welcome header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profile?.user?.first_name}!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Patient ID:&nbsp;
            <span className="font-mono font-semibold text-primary-600">{profile?.patient_id}</span>
          </p>
        </div>
        <Link to="/patient/profile"
          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-xl transition">
          <FiUser size={15} /> View / Edit Profile
        </Link>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Blood Group',  value: profile?.blood_group || '—',             color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'         },
          { label: 'Age',          value: profile?.age ? `${profile.age} yrs` : '—', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'   },
          { label: 'City',         value: profile?.city || '—',                    color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'  },
          { label: 'Total Visits', value: appointments.length,                     color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl p-4 ${item.color}`}>
            <p className="text-xl font-bold">{item.value}</p>
            <p className="text-xs font-medium mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { to: '/patient/book',          label: 'Book Appointment', icon: FiCalendar,     color: 'bg-primary-600' },
          { to: '/patient/appointments',  label: 'My Appointments',  icon: FiFileText,     color: 'bg-green-600'   },
          { to: '/patient/prescriptions', label: 'Prescriptions',    icon: FiHeart,        color: 'bg-orange-500'  },
          { to: '/patient/chatbot',       label: 'Symptom Checker',  icon: FiMessageSquare,color: 'bg-purple-600'  },
          { to: '/patient/profile',       label: 'My Profile',       icon: FiUser,         color: 'bg-gray-600'    },
        ].map((item) => (
          <Link key={item.to} to={item.to}
            className="card flex flex-col items-center gap-3 text-center hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-white`}>
              <item.icon size={22} />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Upcoming',  value: upcoming.length,  color: 'text-blue-600',  bg: 'bg-blue-50 dark:bg-blue-900/10'   },
          { label: 'Completed', value: completed.length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/10' },
          { label: 'Total',     value: appointments.length, color: 'text-gray-700 dark:text-gray-200', bg: 'bg-gray-50 dark:bg-gray-700/40' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label} Appointments</p>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Upcoming Appointments ({upcoming.length})
          </h3>
          {upcoming.length > 0 && (
            <Link to="/patient/appointments" className="text-xs text-primary-600 hover:underline">
              View all
            </Link>
          )}
        </div>

        {upcoming.length === 0 ? (
          <div className="text-center py-8">
            <FiCalendar size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500">No upcoming appointments.</p>
            <Link to="/patient/book" className="text-sm text-primary-600 hover:underline mt-1 inline-block">
              Book one now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((a) => (
              <div key={a.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm">
                    {a.doctor_name?.split(' ')[1]?.[0]}{a.doctor_name?.split(' ')[2]?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{a.doctor_name}</p>
                    <p className="text-xs text-gray-500">
                      {a.appointment_date} &nbsp;&bull;&nbsp; {a.appointment_time}
                      {a.appointment_type && <span className="ml-1 text-gray-400">({a.appointment_type})</span>}
                    </p>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile completeness nudge */}
      {(!profile?.date_of_birth || !profile?.blood_group || !profile?.city) && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <span className="text-amber-500 mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Complete your profile</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              Add your date of birth, blood group, and city for better care.&nbsp;
              <Link to="/patient/profile" className="underline font-medium">Update now</Link>
            </p>
          </div>
        </div>
      )}

    </div>
  )
}