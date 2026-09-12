import { FiMenu, FiBell } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

export default function Header({ onMenuClick }) {
  const { user } = useAuth()

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
        <FiMenu size={22} />
      </button>
      <div className="hidden lg:block">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
          MediCare — Smart Healthcare System
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 relative">
          <FiBell size={20} />
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full">
          {user?.role}
        </span>
      </div>
    </header>
  )
}
