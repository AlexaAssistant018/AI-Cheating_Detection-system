import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Webcam from 'react-webcam'
import axios from 'axios'
import { FaVideo, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa'

const StudentDashboard = () => {
  const { user } = useAuth()
  const webcamRef = useRef(null)
  const [examStarted, setExamStarted] = useState(false)
  const [detectionStatus, setDetectionStatus] = useState('idle')
  const [alerts, setAlerts] = useState([])
  const [timer, setTimer] = useState(0)
  const [sessionId, setSessionId] = useState(null)

  useEffect(() => {
    let interval
    if (examStarted) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
        captureAndAnalyze()
      }, 3000) // Analyze every 3 seconds
    }
    return () => clearInterval(interval)
  }, [examStarted])

  const startExam = async () => {
    try {
      const response = await axios.post('/api/exam/start', {
        userId: user._id,
        examName: 'Sample Exam'
      })
      setSessionId(response.data.sessionId)
      setExamStarted(true)
      setTimer(0)
      setAlerts([])
    } catch (error) {
      console.error('Failed to start exam:', error)
      alert('Failed to start exam. Please try again.')
    }
  }

  const endExam = () => {
    setExamStarted(false)
    setDetectionStatus('idle')
    alert('Exam ended successfully!')
  }

  const captureAndAnalyze = async () => {
    if (!webcamRef.current) return

    const imageSrc = webcamRef.current.getScreenshot()
    if (!imageSrc) return

    try {
      // Convert base64 to blob
      const blob = await fetch(imageSrc).then(r => r.blob())
      const formData = new FormData()
      formData.append('image', blob, 'frame.jpg')

      // Send to AI module
      const response = await axios.post('http://localhost:5001/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const { faces_detected, status, message } = response.data

      // Update status
      if (faces_detected === 0) {
        setDetectionStatus('no-face')
        logEvent('no_face', 'No face detected')
      } else if (faces_detected > 1) {
        setDetectionStatus('multiple-faces')
        logEvent('multiple_faces', `${faces_detected} faces detected`)
      } else {
        setDetectionStatus('normal')
      }

      // Add alert
      if (faces_detected !== 1) {
        setAlerts(prev => [...prev, {
          time: formatTime(timer),
          message,
          type: faces_detected === 0 ? 'warning' : 'danger'
        }].slice(-5)) // Keep last 5 alerts
      }
    } catch (error) {
      console.error('Detection error:', error)
    }
  }

  const logEvent = async (eventType, description) => {
    try {
      await axios.post('/api/exam/log', {
        sessionId,
        userId: user._id,
        eventType,
        description
      })
    } catch (error) {
      console.error('Failed to log event:', error)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusIcon = () => {
    switch (detectionStatus) {
      case 'normal':
        return <FaCheckCircle className="text-green-500 text-3xl" />
      case 'no-face':
        return <FaExclamationTriangle className="text-yellow-500 text-3xl" />
      case 'multiple-faces':
        return <FaTimesCircle className="text-red-500 text-3xl" />
      default:
        return <FaVideo className="text-gray-400 text-3xl" />
    }
  }

  const getStatusText = () => {
    switch (detectionStatus) {
      case 'normal':
        return 'Face Detected - All Good'
      case 'no-face':
        return 'Warning: No Face Detected'
      case 'multiple-faces':
        return 'Alert: Multiple Faces Detected'
      default:
        return 'Ready to Start'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome, {user.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Webcam Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Live Monitoring</h2>
              
              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {examStarted ? (
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <FaVideo className="text-6xl mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Camera will activate when exam starts</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between items-center">
                {!examStarted ? (
                  <button
                    onClick={startExam}
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
                  >
                    Start Exam
                  </button>
                ) : (
                  <>
                    <button
                      onClick={endExam}
                      className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      End Exam
                    </button>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatTime(timer)}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status Panel */}
          <div className="space-y-6">
            {/* Detection Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Detection Status</h3>
              <div className="flex items-center space-x-4">
                {getStatusIcon()}
                <div>
                  <p className="font-medium text-gray-900">{getStatusText()}</p>
                  <p className="text-sm text-gray-500">
                    {examStarted ? 'Monitoring active' : 'Not monitoring'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
              {alerts.length === 0 ? (
                <p className="text-gray-500 text-sm">No alerts yet</p>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        alert.type === 'danger' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-medium ${
                          alert.type === 'danger' ? 'text-red-800' : 'text-yellow-800'
                        }`}>
                          {alert.message}
                        </p>
                        <span className="text-xs text-gray-500">{alert.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Instructions</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Keep your face visible at all times</li>
                <li>• Ensure good lighting</li>
                <li>• Stay alone in the frame</li>
                <li>• Look at the screen</li>
                <li>• No phones or other devices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
