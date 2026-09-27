import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { FiShield, FiMonitor, FiBarChart, FiLock, FiSun, FiMoon, FiArrowRight } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useEffect } from 'react'

const LandingAdmin = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toggleTheme, isDark } = useTheme()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const features = [
    {
      icon: FiMonitor,
      title: 'Live Monitoring',
      description: 'Real-time student monitoring with AI-powered detection'
    },
    {
      icon: FiBarChart,
      title: 'Advanced Analytics',
      description: 'Comprehensive reports and incident tracking'
    },
    {
      icon: FiLock,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with role-based access'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-950 dark:to-dark-900 transition-colors duration-200">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-full bg-white dark:bg-dark-800 shadow-lg hover:shadow-xl transition-all text-gray-600 dark:text-gray-300 z-50"
      >
        {isDark ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
      </button>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-8 shadow-2xl">
            <FiShield className="text-white text-4xl" />
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            ProctorAI
            <span className="block text-3xl md:text-4xl mt-2 bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              Admin Monitoring System
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            AI-powered cheating detection and monitoring platform for secure online examinations.
            Monitor students in real-time with advanced analytics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              Admin Login
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 rounded-xl bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-900 dark:text-white font-semibold shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
            >
              View Demo
            </button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white dark:bg-dark-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-6">
                  <Icon className="text-2xl text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 bg-white dark:bg-dark-900 rounded-2xl p-12 border border-gray-200 dark:border-gray-800 max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                99.9%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Detection Accuracy
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                24/7
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Real-time Monitoring
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                100%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Secure & Private
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-20 text-gray-500 dark:text-gray-400"
        >
          <p>© 2024 ProctorAI. All rights reserved.</p>
          <p className="mt-2 text-sm">Admin-only monitoring system</p>
        </motion.div>
      </div>
    </div>
  )
}

export default LandingAdmin
