import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Spinner, EmptyState } from '../../components/common/UIComponents'

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/prescriptions/').then((r) => setPrescriptions(r.data.results || r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prescriptions Issued</h1>

      {loading ? <Spinner /> : prescriptions.length === 0 ? <EmptyState message="No prescriptions issued yet." /> : (
        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div key={p.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{p.patient_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
                {p.follow_up_date && (
                  <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">Follow-up: {p.follow_up_date}</span>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium text-gray-700 dark:text-gray-300">Diagnosis: </span><span className="text-gray-600 dark:text-gray-400">{p.diagnosis}</span></div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Medicines:</span>
                  <pre className="mt-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg whitespace-pre-wrap font-sans">{p.medicines}</pre>
                </div>
                {p.instructions && <div><span className="font-medium text-gray-700 dark:text-gray-300">Instructions: </span><span className="text-gray-600 dark:text-gray-400">{p.instructions}</span></div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
