import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { Spinner, EmptyState, StatusBadge, Modal } from '../../components/common/UIComponents'

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [prescModal, setPrescModal] = useState(null)
  const [prescForm, setPrescForm] = useState({ diagnosis: '', medicines: '', instructions: '', follow_up_date: '' })
  const [saving, setSaving] = useState(false)

  const fetchAppts = () => {
    api.get('/appointments/')
      .then((r) => setAppointments(r.data.results || r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAppts() }, [])

  // ✅ STATUS UPDATE FUNCTION
  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/`, { status })
      toast.success(`Appointment ${status}`)
      fetchAppts()
    } catch {
      toast.error('Failed.')
    }
  }

  // ✅ CANCEL HANDLER (CONFIRMATION)
  const handleCancel = (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      updateStatus(id, 'cancelled')
    }
  }

  // ✅ PRESCRIPTION SAVE
  const handleAddPrescription = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.post('/prescriptions/', {
        ...prescForm,
        appointment: prescModal.id,
        patient: prescModal.patient,
      })

      toast.success('Prescription added.')
      setPrescModal(null)
    } catch {
      toast.error('Failed to save prescription.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        My Appointments
      </h1>

      {loading ? <Spinner /> : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['Patient', 'Date', 'Time', 'Type', 'Reason', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState message="No appointments." />
                    </td>
                  </tr>
                ) : appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">

                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {a.patient_name}
                    </td>

                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {a.appointment_date}
                    </td>

                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {a.appointment_time}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        a.appointment_type === 'IPD'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}>
                        {a.appointment_type}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                      {a.reason || '—'}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">

                        {/* ✅ PENDING */}
                        {a.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(a.id, 'approved')}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => handleCancel(a.id)}
                              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {/* ✅ APPROVED */}
                        {a.status === 'approved' && (
                          <>
                            <button
                              onClick={() => updateStatus(a.id, 'completed')}
                              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                            >
                              Complete
                            </button>

                            <button
                              onClick={() => setPrescModal(a)}
                              className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                            >
                              Prescribe
                            </button>

                            <button
                              onClick={() => handleCancel(a.id)}
                              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {/* ✅ COMPLETED */}
                        {a.status === 'completed' && (
                          <button
                            onClick={() => setPrescModal(a)}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                          >
                            Prescription
                          </button>
                        )}

                        {/* ❌ CANCELLED */}
                        {a.status === 'cancelled' && (
                          <span className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded-lg">
                            Cancelled
                          </span>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ✅ PRESCRIPTION MODAL */}
      <Modal
        open={!!prescModal}
        onClose={() => setPrescModal(null)}
        title={`Prescription — ${prescModal?.patient_name}`}
      >
        <form onSubmit={handleAddPrescription} className="space-y-4">

          <div>
            <label className="label">Diagnosis</label>
            <textarea
              className="input-field"
              rows={2}
              value={prescForm.diagnosis}
              onChange={(e) => setPrescForm({ ...prescForm, diagnosis: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Medicines</label>
            <textarea
              className="input-field"
              rows={4}
              value={prescForm.medicines}
              onChange={(e) => setPrescForm({ ...prescForm, medicines: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Instructions</label>
            <textarea
              className="input-field"
              rows={2}
              value={prescForm.instructions}
              onChange={(e) => setPrescForm({ ...prescForm, instructions: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Follow-up Date</label>
            <input
              type="date"
              className="input-field"
              value={prescForm.follow_up_date}
              onChange={(e) => setPrescForm({ ...prescForm, follow_up_date: e.target.value })}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPrescModal(null)}
              className="btn-secondary flex-1"
            >
              Close
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

        </form>
      </Modal>
    </div>
  )
}