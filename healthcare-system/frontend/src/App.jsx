/**
 * Main App — routing with role-based protected routes.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Layout
import Layout from './components/Layout/Layout'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import ManageDoctors from './pages/admin/ManageDoctors'
import ManagePatients from './pages/admin/ManagePatients'
import ManageDepartments from './pages/admin/ManageDepartments'
import ManageAppointments from './pages/admin/ManageAppointments'

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorSchedule from './pages/doctor/DoctorSchedule'
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions'

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard'
import BookAppointment from './pages/patient/BookAppointment'
import AppointmentHistory from './pages/patient/AppointmentHistory'
import PatientPrescriptions from './pages/patient/PatientPrescriptions'
import MedicalHistory from './pages/patient/MedicalHistory'
import PatientProfile from './pages/patient/PatientProfile'   // ✅ added

// Chatbot (shared)
import Chatbot from './pages/Chatbot'

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

// Redirect "/" based on role
function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin')  return <Navigate to="/admin"   replace />
  if (user.role === 'doctor') return <Navigate to="/doctor"  replace />
  return <Navigate to="/patient" replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>

            {/* Public routes */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/"         element={<RoleRedirect />} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Layout /></ProtectedRoute>}>
              <Route index               element={<AdminDashboard />} />
              <Route path="doctors"      element={<ManageDoctors />} />
              <Route path="patients"     element={<ManagePatients />} />
              <Route path="departments"  element={<ManageDepartments />} />
              <Route path="appointments" element={<ManageAppointments />} />
              <Route path="chatbot"      element={<Chatbot />} />
            </Route>

            {/* Doctor routes */}
            <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><Layout /></ProtectedRoute>}>
              <Route index                element={<DoctorDashboard />} />
              <Route path="appointments"  element={<DoctorAppointments />} />
              <Route path="schedule"      element={<DoctorSchedule />} />
              <Route path="prescriptions" element={<DoctorPrescriptions />} />
              <Route path="chatbot"       element={<Chatbot />} />
            </Route>

            {/* Patient routes */}
            <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><Layout /></ProtectedRoute>}>
              <Route index                  element={<PatientDashboard />} />
              <Route path="book"            element={<BookAppointment />} />
              <Route path="appointments"    element={<AppointmentHistory />} />
              <Route path="prescriptions"   element={<PatientPrescriptions />} />
              <Route path="medical-history" element={<MedicalHistory />} />
              <Route path="profile"         element={<PatientProfile />} />  {/* ✅ added */}
              <Route path="chatbot"         element={<Chatbot />} />
            </Route>

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}