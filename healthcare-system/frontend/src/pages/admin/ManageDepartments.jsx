/**
 * Admin: Manage Departments
 * Full CRUD — Add / Edit / Delete departments with emoji icon picker.
 */

import { useState, useEffect } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiGrid } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { Spinner, EmptyState, Modal } from '../../components/common/UIComponents'

// Common medical emojis for quick pick
const EMOJI_OPTIONS = [
  '🏥','❤️','🧠','🦴','👶','👩‍⚕️','🌿','🍽️','👁️','👂',
  '⚗️','🧘','💊','🩺','🩻','🧬','🩸','💉','🫀','🫁',
  '🦷','🦶','🤝','🧪','🔬','🩹','🏃','🧑‍⚕️','⚕️','🌡️',
]

const EMPTY_FORM = { name: '', description: '', icon: '🏥' }

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editDept, setEditDept]       = useState(null)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [saving, setSaving]           = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [deleteId, setDeleteId]       = useState(null)
  const [deleting, setDeleting]       = useState(false)

  const fetchDepts = () => {
    setLoading(true)
    api.get('/departments/')
      .then((r) => setDepartments(r.data.results || r.data))
      .catch(() => toast.error('Failed to load departments.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchDepts() }, [])

  const openAdd = () => {
    setEditDept(null)
    setForm(EMPTY_FORM)
    setShowEmojiPicker(false)
    setModalOpen(true)
  }

  const openEdit = (d) => {
    setEditDept(d)
    setForm({ name: d.name, description: d.description || '', icon: d.icon || '🏥' })
    setShowEmojiPicker(false)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    setDeleting(true)
    try {
      await api.delete(`/departments/${id}/`)
      toast.success('Department deleted.')
      setDeleteId(null)
      fetchDepts()
    } catch {
      toast.error('Cannot delete — doctors may be linked to this department.')
    } finally {
      setDeleting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Department name required.'); return }
    setSaving(true)
    try {
      if (editDept) {
        await api.patch(`/departments/${editDept.id}/`, form)
        toast.success('Department updated.')
      } else {
        await api.post('/departments/', form)
        toast.success('Department created.')
      }
      setModalOpen(false)
      fetchDepts()
    } catch (err) {
      const msg = err.response?.data?.name?.[0] || err.response?.data?.detail || 'Failed to save.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Departments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {departments.length} department{departments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Department
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <Spinner />
      ) : departments.length === 0 ? (
        <EmptyState message="No departments found. Click 'Add Department' to create one." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div key={d.id} className="card flex items-start gap-4 group">
              {/* Icon */}
              <div className="text-4xl select-none flex-shrink-0">{d.icon || '🏥'}</div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white">{d.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                  {d.description || '—'}
                </p>
                <p className="text-xs text-primary-600 mt-1 font-medium">
                  {d.doctor_count} doctor{d.doctor_count !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(d)}
                  title="Edit"
                  className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition"
                >
                  <FiEdit size={14} />
                </button>
                <button
                  onClick={() => setDeleteId(d.id)}
                  title="Delete"
                  className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editDept ? `Edit — ${editDept.name}` : 'New Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Icon picker */}
          <div>
            <label className="label">Icon</label>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{form.icon}</span>
              <button
                type="button"
                onClick={() => setShowEmojiPicker((p) => !p)}
                className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <FiGrid size={13} /> Pick emoji
              </button>
              <input
                className="input-field w-24 text-lg text-center"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                maxLength={4}
                placeholder="or type"
              />
            </div>

            {/* Emoji grid */}
            {showEmojiPicker && (
              <div className="mt-2 p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { setForm({ ...form, icon: emoji }); setShowEmojiPicker(false) }}
                    className={`text-2xl p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition ${form.icon === emoji ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-500' : ''}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="label">Department Name *</label>
            <input
              className="input-field"
              placeholder="e.g. Cardiology"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Brief description of this department..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving ? 'Saving...' : editDept ? 'Update' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Department"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this department? This action cannot be undone.
            Doctors linked to this department will become unassigned.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteId(null)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteId)}
              disabled={deleting}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}