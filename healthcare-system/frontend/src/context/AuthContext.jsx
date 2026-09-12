/**
 * Auth Context — manages JWT login state, user info, and role-based access.
 */

import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('access_token')
    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login/', { username, password })
      const { access, refresh, user: userData } = res.data
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      toast.success(`Welcome back, ${userData.first_name}!`)
      return { success: true, role: userData.role }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid credentials.'
      toast.error(msg)
      return { success: false }
    }
  }

  const register = async (data) => {
    try {
      await api.post('/auth/register/', data)
      toast.success('Registration successful! Please login.')
      return { success: true }
    } catch (err) {
      const errors = err.response?.data
      const msg = errors ? Object.values(errors).flat().join(' ') : 'Registration failed.'
      toast.error(msg)
      return { success: false }
    }
  }

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      await api.post('/auth/logout/', { refresh })
    } catch {}
    localStorage.clear()
    setUser(null)
    toast.success('Logged out successfully.')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
