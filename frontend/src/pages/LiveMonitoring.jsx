import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import CameraCard from '../components/CameraCard'
import AlertBox from '../components/AlertBox'
import WarningModal from '../components/WarningModal'
import axios from 'axios'
import { io } from 'socket.io-client'
import {
  FaPlay, FaStop, FaClock, FaCheckCircle, FaExclamationTriangle,
  FaTimesCircle, FaEye, FaExpand, FaCompress, FaChartBar
} from 'react-icons/fa'

const SOCKET_URL        = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
const AI_URL            = import.meta.env.VITE_AI_URL     || 'http://localhost:5001'
const DETECTION_INTERVAL = 3000

// Sound alert (Web Audio API — no file needed)
const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 880
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4)
  } catch (_) {}
}

const StatMini = ({ label, value, color }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="glass p-4 text-center"
  >
    <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
    <p className="text-xs text-slate-400 mt-1">{label}</p>
  </motion.div>
)

const LiveMonitoring = () => {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const webcamRef  = useRef(null)
  const socketRef  = useRef(null)
  const intervalRef = useRef(null)

  const [examStarted, setExamStarted] = useState(false)
  const [sessionId, setSessionId]     = useState(null)
  const [status, setStatus]           = useState('idle')
  const [alerts, setAlerts]           = useState([])
  const [elapsed, setElapsed]         = useState(0)
  const [analyzing, setAnalyzing]     = useState(false)
  const [fullscreen, setFullscreen]   = useState(false)
  const [modal, setModal]             = useState({ show: false, title: '', message: '' })

  // Timer
  useEffect(() => {
    let t
    if (examStarted) t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [examStarted])

  // Socket.IO
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    socketRef.current.on('new-event', (event) => {
      addAlert(event.eventType, event.description, event.confidence)
    })
    return () => socketRef.current?.disconnect()
  }, [])

  useEffect(() => {
    if (sessionId && socketRef.current) {
      socketRef.current.emit('join-session', sessionId)
    }
  }, [sessionId])

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }

  const addAlert = useCallback((eventType, description, confidence) => {
    setAlerts(prev => [{
      id: Date.now() + Math.random(),
      eventType, description, confidence,
      time: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 30))
    playBeep()
  }, [])

  const captureAndAnalyze = useCallback(async () => {
    if (!webcamRef.current || !sessionId || analyzing) return
    const imageSrc = webcamRef.current.getScreenshot()
    if (!imageSrc) return

    setAnalyzing(true)
    try {
      const blob = await fetch(imageSrc).then(r => r.blob())
      const formData = new FormData()
      formData.append('image', blob, 'frame.jpg')

      const res = await axios.post(`${AI_URL}/detect-advanced`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 5000
      })

      const { faces_detected, warnings = [], looking_away } = res.data

      if (faces_detected === 0)       setStatus('no_face')
      else if (faces_detected > 1)    setStatus('multiple_faces')
      else if (looking_away)          setStatus('suspicious')
      else                            setStatus('monitoring')

      for (const w of warnings) {
        try {
          await axios.post('/api/exam/event', {
            sessionId,
            eventType:   w.type,
            description: w.description || w.type.replace(/_/g, ' '),
            confidence:  w.confidence
          })
          addAlert(w.type, w.description || w.type.replace(/_/g, ' '), w.confidence)

          // Show modal for severe events
          if (['multiple_faces', 'phone_detected'].includes(w.type)) {
            setModal({
              show: true,
              title: '⚠️ Suspicious Activity Detected',
              message: w.description || 'A cheating attempt has been flagged and recorded.'
            })
          }
        } catch (_) {}
      }
    } catch (err) {
      console.error('Detection error:', err)
    } finally {
      setAnalyzing(false)
    }
  }, [sessionId, analyzing, addAlert])

  useEffect(() => {
    if (examStarted) {
      intervalRef.current = setInterval(captureAndAnalyze, DETECTION_INTERVAL)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [examStarted, captureAndAnalyze])

  const startExam = async () => {
    try {
      const res = await axios.post('/api/exam/start', { examName: 'Live Exam' })
      setSessionId(res.data.sessionId)
      setExamStarted(true)
      setElapsed(0)
      setAlerts([])
      setStatus('monitoring')
    } catch (err) {
      alert('Failed to start exam. Make sure the backend is running.')
    }
  }

  const endExam = async () => {
    if (sessionId) {
      try { await axios.post(`/api/exam/end/${sessionId}`) } catch (_) {}
    }
    setExamStarted(false)
    setStatus('idle')
    clearInterval(intervalRef.current)
  }

  const rules = [
    'Keep your face visible at all times',
    'Ensure good lighting in your room',
    'Stay alone in the camera frame',
    'Look at the screen — not away',
    'No phones or other devices',
    'Do not leave the frame',
  ]

  return (
    <Layout title="Live Monitoring" subtitle={`Welcome, ${user?.name}`} alertCount={alerts.length}>
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-5"
      >
        {/* Top bar: timer + controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${examStarted ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-sm font-medium text-slate-300">
              {examStarted ? 'Exam in progress' : 'Ready to start'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {examStarted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 glass px-4 py-2"
              >
                <FaClock className="text-primary-400 text-sm" />
                <span className="font-mono font-bold text-white text-lg">{formatTime(elapsed)}</span>
              </motion.div>
            )}

            {!examStarted ? (
              <motion.button whileTap={{ scale: 0.95 }} onClick={startExam} className="btn-primary">
                <FaPlay className="text-sm" /> Start Exam
              </motion.button>
            ) : (
              <motion.button whileTap={{ scale: 0.95 }} onClick={endExam} className="btn-danger">
                <FaStop className="text-sm" /> End Exam
              </motion.button>
            )}

            <button onClick={() => navigate('/reports')} className="btn-ghost text-sm">
              <FaChartBar className="text-sm" /> Reports
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Camera — 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            <CameraCard
              ref={webcamRef}
              active={examStarted}
              status={status}
              analyzing={analyzing}
              onUserMedia={() => {}}
              onUserMediaError={() => alert('Camera access denied. Please allow camera access.')}
            />

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              <StatMini label="Total Alerts"  value={alerts.length}                                                    color="text-white" />
              <StatMini label="Multi-Face"    value={alerts.filter(a => a.eventType === 'multiple_faces').length}      color="text-red-400" />
              <StatMini label="No Face"       value={alerts.filter(a => a.eventType === 'no_face').length}             color="text-orange-400" />
              <StatMini label="Looking Away"  value={alerts.filter(a => a.eventType === 'looking_away').length}        color="text-yellow-400" />
            </div>

            {/* Rules */}
            <div className="glass p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Exam Rules</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rules.map((r, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                    <FaCheckCircle className="text-green-500 flex-shrink-0 text-xs" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right panel — 1/3 */}
          <div className="space-y-4">
            {/* Status card */}
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={`glass p-5 border-2 transition-all duration-500 ${
                status === 'monitoring'     ? 'border-green-500/50 bg-green-500/5' :
                status === 'multiple_faces' ? 'border-red-500/50 bg-red-500/5' :
                status === 'no_face'        ? 'border-orange-500/50 bg-orange-500/5' :
                status === 'suspicious'     ? 'border-yellow-500/50 bg-yellow-500/5' :
                'border-slate-700/50'
              }`}
            >
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Detection Status</p>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                  status === 'monitoring'     ? 'bg-green-500/20 text-green-400' :
                  status === 'multiple_faces' ? 'bg-red-500/20 text-red-400' :
                  status === 'no_face'        ? 'bg-orange-500/20 text-orange-400' :
                  status === 'suspicious'     ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {status === 'monitoring'     ? <FaCheckCircle /> :
                   status === 'multiple_faces' ? <FaTimesCircle /> :
                   status === 'no_face'        ? <FaEye /> :
                   status === 'suspicious'     ? <FaExclamationTriangle /> :
                   <FaEye />}
                </div>
                <div>
                  <p className={`font-bold ${
                    status === 'monitoring'     ? 'text-green-400' :
                    status === 'multiple_faces' ? 'text-red-400' :
                    status === 'no_face'        ? 'text-orange-400' :
                    status === 'suspicious'     ? 'text-yellow-400' :
                    'text-slate-400'
                  }`}>
                    {status === 'monitoring'     ? 'All Clear' :
                     status === 'multiple_faces' ? 'Multiple Faces!' :
                     status === 'no_face'        ? 'No Face Detected' :
                     status === 'suspicious'     ? 'Suspicious Activity' :
                     'Not Started'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {examStarted ? `Scanning every ${DETECTION_INTERVAL / 1000}s` : 'Start exam to monitor'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Alert log */}
            <div className="h-96">
              <AlertBox alerts={alerts} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Warning modal */}
      <WarningModal
        show={modal.show}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ show: false, title: '', message: '' })}
      />
    </Layout>
  )
}

export default LiveMonitoring
