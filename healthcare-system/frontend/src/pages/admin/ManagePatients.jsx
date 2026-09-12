import { useState, useEffect } from 'react'
import { FiSearch } from 'react-icons/fi'
import api from '../../services/api'
import { Spinner, EmptyState } from '../../components/common/UIComponents'

export default function ManagePatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get(`/patients/?search=${search}`)
      .then((r) => setPatients(r.data.results || r.data))
      .finally(() => setLoading(false))
  }, [search])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Patients</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{patients.length} patients registered</p>
      </div>

      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input className="input-field pl-10" placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? <Spinner /> : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['Patient ID', 'Name', 'Gender', 'Age', 'Blood Group', 'Phone', 'City', 'Type'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {patients.length === 0 ? (
                  <tr><td colSpan={8}><EmptyState message="No patients found." /></td></tr>
                ) : patients.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3 font-mono text-xs text-primary-600 font-semibold">{p.patient_id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{p.user?.first_name} {p.user?.last_name}</div>
                      <div className="text-xs text-gray-500">{p.user?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.age ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.blood_group || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.user?.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.city || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.is_ipd ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'}`}>
                        {p.is_ipd ? 'IPD' : 'OPD'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
