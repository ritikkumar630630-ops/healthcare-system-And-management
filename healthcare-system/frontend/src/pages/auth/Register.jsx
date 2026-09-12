import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password2: '',
    role: 'patient',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showPass2, setShowPass2] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const validate = () => {
    if (form.username.length < 3) return 'Username must be at least 3 characters'
    if (!form.email.includes('@')) return 'Enter valid email'
    if (form.phone && form.phone.length !== 10) return 'Phone must be 10 digits'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    if (form.password !== form.password2) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const err = validate()
    if (err) return setError(err)

    setLoading(true)

    try {
      const result = await register(form)

      if (result.success) {
        setSuccess('Account created successfully! Redirecting...')
        setTimeout(() => navigate('/login'), 1500)
      } else {
        setError(result.message || 'Registration failed')
      }
    } catch {
      setError('Something went wrong!')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 px-4">

      <div className="w-full max-w-lg animate-fadeIn">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <span className="text-2xl font-bold text-blue-600">+</span>
          </div>
          <h1 className="text-2xl font-bold text-white">MediCare</h1>
          <p className="text-blue-200 text-sm">Create your account</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">

          {/* Alerts */}
          {error && (
            <div className="alert-error mb-4">{error}</div>
          )}
          {success && (
            <div className="alert-success mb-4">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input className="input-field" value={form.first_name} onChange={set('first_name')} />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input-field" value={form.last_name} onChange={set('last_name')} />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="label">Username</label>
              <input className="input-field" value={form.username} onChange={set('username')} />
            </div>

            {/* Email */}
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" value={form.email} onChange={set('email')} />
            </div>

            {/* Phone */}
            <div>
              <label className="label">Phone</label>
              <input type="tel" className="input-field" value={form.phone} onChange={set('phone')} />
            </div>

            {/* Role */}
            <div>
              <label className="label">Register As</label>
              <select className="input-field" value={form.role} onChange={set('role')}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor (requires approval)</option>
              </select>
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-field pr-10"
                    value={form.password}
                    onChange={set('password')}
                  />
                  <span
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3 cursor-pointer"
                  >
                    {showPass ? '🙈' : '👁️'}
                  </span>
                </div>
              </div>

              <div>
                <label className="label">Confirm</label>
                <div className="relative">
                  <input
                    type={showPass2 ? 'text' : 'password'}
                    className="input-field pr-10"
                    value={form.password2}
                    onChange={set('password2')}
                  />
                  <span
                    onClick={() => setShowPass2(!showPass2)}
                    className="absolute right-3 top-3 cursor-pointer"
                  >
                    {showPass2 ? '🙈' : '👁️'}
                  </span>
                </div>
              </div>
            </div>

            {/* Password Hint */}
            <p className="text-xs text-gray-500">
              Password must be at least 6 characters
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex justify-center items-center"
            >
              {loading ? (
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login */}
          <p className="text-center text-sm text-gray-600 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}