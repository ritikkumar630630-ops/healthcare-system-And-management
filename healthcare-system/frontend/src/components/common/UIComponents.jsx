/**
 * Reusable StatusBadge component for appointment statuses.
 */

export function StatusBadge({ status }) {
  const classes = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
  }
  return (
    <span className={classes[status] || 'badge-pending'}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  )
}

/**
 * Stat card for dashboard.
 */
export function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  }
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center text-white flex-shrink-0`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '...'}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>}
      </div>
    </div>
  )
}

/**
 * Loading spinner.
 */
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  )
}

/**
 * Empty state placeholder.
 */
export function EmptyState({ message = 'No data found.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-600">
      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  )
}

/**
 * Modal wrapper.
 */
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
