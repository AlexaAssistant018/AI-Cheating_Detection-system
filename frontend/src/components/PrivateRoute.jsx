import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { FaShieldAlt } from 'react-icons/fa'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full"
      />
      <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
        <FaShieldAlt className="text-primary-400" />
        <span className="text-sm">Admin Panel</span>
      </div>
    </div>
  )

  // Only allow admin users
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute
