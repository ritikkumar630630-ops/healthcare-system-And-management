/**
 * Sidebar navigation — role-aware links, dark mode toggle, logout.
 */

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import {
  FiHome, FiUsers, FiCalendar, FiClipboard, FiFileText,
  FiSettings, FiLogOut, FiSun, FiMoon, FiMessageSquare,
  FiActivity, FiGrid, FiClock, FiDollarSign, FiHeart
} from 'react-icons/fi'

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/admin/doctors', label: 'Doctors', icon: FiUsers },
  { to: '/admin/patients', label: 'Patients', icon: FiActivity },
  { to: '/admin/departments', label: 'Departments', icon: FiGrid },
  { to: '/admin/appointments', label: 'Appointments', icon: FiCalendar },
  { to: '/admin/chatbot', label: 'AI Chatbot', icon: FiMessageSquare },
]

const doctorNav = [
  { to: '/doctor', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/doctor/appointments', label: 'Appointments', icon: FiCalendar },
  { to: '/doctor/schedule', label: 'My Schedule', icon: FiClock },
  { to: '/doctor/prescriptions', label: 'Prescriptions', icon: FiClipboard },
  { to: '/doctor/chatbot', label: 'AI Chatbot', icon: FiMessageSquare },
]

const patientNav = [
  { to: '/patient', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/patient/book', label: 'Book Appointment', icon: FiCalendar },
  { to: '/patient/appointments', label: 'My Appointments', icon: FiFileText },
  { to: '/patient/prescriptions', label: 'Prescriptions', icon: FiClipboard },
  { to: '/patient/medical-history', label: 'Medical History', icon: FiHeart },
  { to: '/patient/chatbot', label: 'Symptom Checker', icon: FiMessageSquare },
]

const navByRole = { admin: adminNav, doctor: doctorNav, patient: patientNav }

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const navItems = navByRole[user?.role] || []

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 z-30 h-full w-64 flex flex-col
        bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white text-lg font-bold">+</div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm leading-none">MediCare</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">{user?.role} Panel</p>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
