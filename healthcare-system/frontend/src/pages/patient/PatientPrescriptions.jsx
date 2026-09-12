import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Spinner, EmptyState } from '../../components/common/UIComponents'

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/prescriptions/').then((r) => setPrescriptions(r.data.results || r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Prescriptions</h1>
      {loading ? <Spinner /> : prescriptions.length === 0 ? <EmptyState message="No prescriptions yet." /> : (
        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div key={p.id} className="card border-l-4 border-l-primary-500">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{p.doctor_name}</p>
                  <p className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                {p.follow_up_date && (
                  <span className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 px-2 py-0.5 rounded-full">Follow-up: {p.follow_up_date}</span>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide mb-1">Diagnosis</p>
                  <p className="text-red-800 dark:text-red-300">{p.diagnosis}</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">Prescribed Medicines</p>
                  <pre className="text-green-800 dark:text-green-300 whitespace-pre-wrap font-sans text-xs">{p.medicines}</pre>
                </div>
                {p.instructions && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Instructions</p>
                    <p className="text-blue-800 dark:text-blue-300">{p.instructions}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
