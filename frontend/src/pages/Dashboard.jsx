import { useState, useEffect } from 'react'
import { FiUsers, FiAlertTriangle, FiActivity, FiTrendingUp, FiEye, FiClock } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { adminAPI } from '../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeMonitoring: 0,
    totalAlerts: 0,
    sessionsToday: 0
  })
  const [recentAlerts, setRecentAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 5000) // Refresh every 5s
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getSessions()
      ])
      
      setStats(statsRes.data || {
        totalStudents: 45,
        activeMonitoring: 12,
        totalAlerts: 28,
        sessionsToday: 15
      })
      
      // Mock recent alerts
      setRecentAlerts([
        { id: 1, student: 'John Doe', type: 'Multiple Faces', time: '2 min ago', severity: 'high' },
        { id: 2, student: 'Jane Smith', type: 'No Face Detected', time: '5 min ago', severity: 'medium' },
        { id: 3, student: 'Mike Johnson', type: 'Looking Away', time: '8 min ago', severity: 'low' },
        { id: 4, student: 'Sarah Williams', type: 'Phone Detected', time: '12 min ago', severity: 'high' },
      ])
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Use mock data on error
      setStats({
        totalStudents: 45,
        activeMonitoring: 12,
        totalAlerts: 28,
        sessionsToday: 15
      })
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: FiUsers,
      color: 'blue',
      change: '+12%',
      bgClass: 'bg-blue-500'
    },
    {
      title: 'Active Monitoring',
      value: stats.activeMonitoring,
      icon: FiEye,
      color: 'green',
      change: 'Live',
      bgClass: 'bg-green-500'
    },
    {
      title: 'Total Alerts',
      value: stats.totalAlerts,
      icon: FiAlertTriangle,
      color: 'red',
      change: '+5 today',
      bgClass: 'bg-red-500'
    },
    {
      title: 'Sessions Today',
      value: stats.sessionsToday,
      icon: FiActivity,
      color: 'purple',
      change: '+8%',
      bgClass: 'bg-purple-500'
    }
  ]

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
      case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-dark-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgClass} bg-opacity-10`}>
                  <Icon className={`text-2xl text-${stat.color}-600`} />
                </div>
                <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Alerts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-dark-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Alerts</h2>
            <FiAlertTriangle className="text-red-500" />
          </div>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {alert.student}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{alert.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <FiClock className="text-xs" />
                    {alert.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-dark-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Activity Overview</h2>
            <FiTrendingUp className="text-green-500" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <FiActivity className="text-4xl text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Chart visualization coming soon</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Start Live Monitoring</h3>
            <p className="text-primary-100">Monitor all active exam sessions in real-time</p>
          </div>
          <button className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
            Go to Live Feed
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
