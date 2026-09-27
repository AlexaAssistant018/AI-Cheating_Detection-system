import { useState, useRef, useEffect } from 'react'
import { FiVideo, FiAlertCircle, FiCheckCircle, FiXCircle, FiPlay, FiPause, FiClock } from 'react-icons/fi'
import { motion } from 'framer-motion'
import Webcam from 'react-webcam'

const LiveMonitoringAdmin = () => {
  const webcamRef = useRef(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [detectionStatus, setDetectionStatus] = useState('idle') // idle, normal, suspicious, alert
  const [alertCount, setAlertCount] = useState(0)
  const [sessionTime, setSessionTime] = useState(0)
  const [recentAlerts, setRecentAlerts] = useState([])

  // Timer effect
  useEffect(() => {
    let interval
    if (isMonitoring) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isMonitoring])

  // Simulated detection (replace with actual AI detection)
  useEffect(() => {
    let detectionInterval
    if (isMonitoring) {
      detectionInterval = setInterval(() => {
        // Simulate random detection
        const random = Math.random()
        if (random > 0.9) {
          setDetectionStatus('alert')
          setAlertCount(prev => prev + 1)
          addAlert('Multiple faces detected', 'high')
        } else if (random > 0.8) {
          setDetectionStatus('suspicious')
          addAlert('No face detected', 'medium')
        } else {
          setDetectionStatus('normal')
        }
      }, 3000) // Check every 3 seconds
    }
    return () => clearInterval(detectionInterval)
  }, [isMonitoring])

  const addAlert = (message, severity) => {
    const newAlert = {
      id: Date.now(),
      message,
      severity,
      time: new Date().toLocaleTimeString()
    }
    setRecentAlerts(prev => [newAlert, ...prev].slice(0, 5))
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'normal':
        return {
          icon: FiCheckCircle,
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          label: 'Normal - All Good'
        }
      case 'suspicious':
        return {
          icon: FiAlertCircle,
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          label: 'Suspicious Activity'
        }
      case 'alert':
        return {
          icon: FiXCircle,
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          label: 'Alert - Cheating Detected!'
        }
      default:
        return {
          icon: FiVideo,
          color: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          label: 'Ready to Monitor'
        }
    }
  }

  const statusConfig = getStatusConfig(detectionStatus)
  const StatusIcon = statusConfig.icon

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
      default:
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Live Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time webcam monitoring with AI detection</p>
        </div>
        <div className="flex items-center gap-3">
          {isMonitoring && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webcam Feed - Takes 2 columns */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-dark-900 rounded-xl border-2 ${statusConfig.border} overflow-hidden`}
          >
            {/* Video Container */}
            <div className="relative aspect-video bg-gray-900">
              {isMonitoring ? (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: 'user'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <FiVideo className="text-6xl text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Click "Start Monitoring" to begin</p>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              {isMonitoring && (
                <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg ${statusConfig.bg} ${statusConfig.border} border backdrop-blur-sm`}>
                  <StatusIcon className={`text-lg ${statusConfig.color}`} />
                  <span className={`text-sm font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
              )}

              {/* Timer */}
              {isMonitoring && (
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/70 backdrop-blur-sm">
                  <FiClock className="text-white" />
                  <span className="text-white font-mono font-medium">
                    {formatTime(sessionTime)}
                  </span>
                </div>
              )}

              {/* Live Indicator */}
              {isMonitoring && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 bg-red-600 rounded-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-sm font-medium">LIVE</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsMonitoring(!isMonitoring)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                      isMonitoring
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    {isMonitoring ? (
                      <>
                        <FiPause />
                        Stop Monitoring
                      </>
                    ) : (
                      <>
                        <FiPlay />
                        Start Monitoring
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Session Time</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                      {formatTime(sessionTime)}
                    </p>
                  </div>
                  <div className="text-center px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Alerts</p>
                    <p className={`text-lg font-bold font-mono ${alertCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                      {alertCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Stats & Alerts */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-dark-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Session Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <span className={`text-sm font-medium ${statusConfig.color}`}>
                  {isMonitoring ? statusConfig.label : 'Idle'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                  {formatTime(sessionTime)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Alerts</span>
                <span className={`text-sm font-medium ${alertCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {alertCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Detection Interval</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">3 seconds</span>
              </div>
            </div>
          </motion.div>

          {/* Recent Alerts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-dark-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Alerts</h3>
            <div className="space-y-2">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border text-sm ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium flex-1">{alert.message}</p>
                      <span className="text-xs opacity-75 whitespace-nowrap">{alert.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FiCheckCircle className="text-4xl text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">No alerts yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
          >
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-3">Instructions</h3>
            <ul className="space-y-2 text-xs text-blue-700 dark:text-blue-400">
              <li>• Click "Start Monitoring" to begin</li>
              <li>• AI checks every 3 seconds</li>
              <li>• Green = Normal, Yellow = Suspicious, Red = Alert</li>
              <li>• All alerts are logged automatically</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default LiveMonitoringAdmin
