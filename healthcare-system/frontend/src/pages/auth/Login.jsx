import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  FiUser, FiLock, FiEye, FiEyeOff, FiShield,
  FiClock, FiUserCheck, FiHeart, FiPlus, FiActivity,
} from 'react-icons/fi'
import { FaStethoscope } from 'react-icons/fa'

const ROLES = [
  { key: 'admin',   label: 'Admin' },
  { key: 'doctor',  label: 'Doctor' },
  { key: 'patient', label: 'Patient' },
]

const DEMOS = {
  admin:   { username: 'admin',        password: 'Admin@123' },
  doctor:  { username: 'dr.sharma',    password: 'Doctor@123' },
  patient: { username: 'rahul.kumar',  password: 'Patient@123' },
}

const FEATURES = [
  { icon: FiUserCheck, title: 'Expert Doctors',    desc: '100+ specialists across 12 departments' },
  { icon: FiClock,     title: '24/7 Availability', desc: 'Book appointments anytime, anywhere' },
  { icon: FiShield,    title: 'Secure Records',    desc: 'Your medical data, safely protected' },
]

function HospitalSkyline() {
  return (
    <svg
      viewBox="0 0 500 120"
      preserveAspectRatio="none"
      className="absolute bottom-0 left-0 w-full h-28 text-white/10"
      fill="currentColor"
    >
      <rect x="0"   y="55" width="60" height="65" />
      <rect x="65"  y="30" width="45" height="90" />
      <rect x="118" y="65" width="50" height="55" />
      <rect x="176" y="10" width="60" height="110" />
      <rect x="196" y="0"  width="20" height="14" />
      <rect x="203" y="-10" width="6" height="14" />
      <rect x="242" y="45" width="42" height="75" />
      <rect x="290" y="70" width="55" height="50" />
      <rect x="351" y="25" width="48" height="95" />
      <rect x="405" y="58" width="40" height="62" />
      <rect x="450" y="38" width="50" height="82" />
      {/* windows */}
      {Array.from({ length: 10 }).map((_, row) =>
        Array.from({ length: 24 }).map((_, col) => (
          <rect
            key={`${row}-${col}`}
            x={10 + col * 20}
            y={20 + row * 10}
            width="4"
            height="5"
            className="text-white/10"
            fill="currentColor"
          />
        ))
      )}
    </svg>
  )
}

function EcgLine() {
  return (
    <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="w-full h-14 overflow-visible">
      <path
        d="M0,30 H120 L135,10 L150,50 L165,30 H400"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-ecg opacity-70"
      />
    </svg>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.username.length < 3) return setError('Please enter a valid username')
    if (form.password.length < 5) return setError('Please enter a valid password')

    setLoading(true)
    try {
      const result = await login(form.username, form.password)
      if (result.success) {
        if (result.role === 'admin') navigate('/admin')
        else if (result.role === 'doctor') navigate('/doctor')
        else navigate('/patient')
      } else {
        setError('Incorrect username or password.')
      }
    } catch {
      setError('Unable to reach the server. Please try again.')
    }
    setLoading(false)
  }

  const fillDemo = (role) => {
    setSelectedRole(role)
    setForm(DEMOS[role])
    setError('')
  }

  return (
    <div className="min-h-screen flex bg-gray-50 relative overflow-hidden">

      {/* Faint medical-cross grid on the page background */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M27 14h6v10h10v6H33v10h-6V30H17v-6h10z' fill='%231a56db'/%3E%3C/svg%3E\")",
        }}
      ></div>

      {/* Left — Brand / Info panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-hospital-blue via-blue-700 to-blue-900">

        {/* Drifting blurred blobs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-blob"></div>
        <div className="absolute bottom-10 -right-16 w-[26rem] h-[26rem] rounded-full bg-hospital-green/20 blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/3 right-10 w-56 h-56 rounded-full bg-cyan-300/10 blur-3xl animate-blob" style={{ animationDelay: '8s' }}></div>

        {/* Hospital skyline silhouette */}
        <HospitalSkyline />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">

          <div className="flex items-center gap-3 animate-fadeInUp">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <span className="absolute inset-0 rounded-xl bg-white/40 animate-pulse-ring"></span>
              <div className="relative w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <FiPlus className="text-hospital-blue text-2xl" strokeWidth={3} />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">MediCare</span>
          </div>

          <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Smart Healthcare,<br />Right at Your Fingertips
            </h1>
            <p className="text-blue-100 text-base mb-8 max-w-md">
              One platform for patients, doctors, and administrators — appointments,
              prescriptions, and billing, all in one place.
            </p>

            {/* Heartbeat monitor line */}
            <div className="mb-8 -ml-2">
              <EcgLine />
            </div>

            <div className="space-y-5">
              {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={title}
                  className="flex items-start gap-4 animate-fadeInUp"
                  style={{ animationDelay: `${0.2 + i * 0.12}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                    <Icon className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-blue-200 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-blue-200 text-sm animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            <FiHeart className="text-red-400" />
            <span>Trusted by 2,000+ patients &amp; 100+ doctors</span>
          </div>
        </div>

        {/* Floating decorative icon badges */}
        <div className="absolute top-16 right-14 w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center animate-float" style={{ animationDuration: '5s' }}>
          <FaStethoscope className="text-white/70 text-2xl" />
        </div>
        <div className="absolute top-1/2 right-24 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center animate-float" style={{ animationDuration: '4s', animationDelay: '1s' }}>
          <FiHeart className="text-red-300/80 text-lg" />
        </div>
        <div className="absolute bottom-40 right-8 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center animate-float" style={{ animationDuration: '6s', animationDelay: '2s' }}>
          <FiActivity className="text-cyan-200/80 text-xl" />
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">

          {/* Mobile logo (shown only when left panel is hidden) */}
          <div className="lg:hidden text-center mb-8 animate-fadeInUp">
            <div className="w-14 h-14 mx-auto bg-hospital-blue rounded-2xl flex items-center justify-center shadow-lg mb-3">
              <FiPlus className="text-white text-2xl" strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MediCare</h1>
            <p className="text-gray-500 text-sm">Smart Healthcare System</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 text-sm mt-1">Sign in to continue to your dashboard</p>
            </div>

            {/* Role quick-select */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {ROLES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => fillDemo(key)}
                  className={`py-2 text-sm font-medium rounded-lg border transition-all duration-200
                    ${selectedRole === key
                      ? 'bg-hospital-blue text-white border-hospital-blue scale-[1.03] shadow-md shadow-blue-900/20'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-hospital-blue hover:text-hospital-blue hover:scale-[1.02]'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-5 border border-red-100 animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                <div className="relative group">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-hospital-blue transition-colors" />
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-hospital-blue/40 focus:border-hospital-blue transition-all duration-200 focus:scale-[1.015]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative group">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-hospital-blue transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-hospital-blue/40 focus:border-hospital-blue transition-all duration-200 focus:scale-[1.015]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-hospital-blue hover:bg-blue-800 disabled:opacity-60 text-white rounded-xl font-semibold transition-all duration-200 shadow-md shadow-blue-900/10 hover:shadow-lg hover:shadow-blue-900/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              New here?{' '}
              <Link to="/register" className="text-hospital-blue font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            © {new Date().getFullYear()} MediCare Hospital. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
