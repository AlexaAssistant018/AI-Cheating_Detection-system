import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import axios from 'axios'
import { io } from 'socket.io-client'
import {
  FaUsers, FaExclamationTriangle, FaCheckCircle,
  FaClock, FaBell, FaCircle, FaGraduationCap
} from 'react-icons/fa'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

const StatCard = ({ icon, label, value, color, bg }) => (
  <motion.div whileHover={{ y: -2 }} className={`glass p-5 border ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
        <motion.p
          key={value}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mt-1 font-mono"
        >
          {value}
        </motion.p>
      </div>
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center text-xl`}>
        {icon}
      </div>
    </div>
  </motion.div>
)

const eventColors = {
  no_face:        'bg-orange-500/20 text-orange-300 border-orange-500/30',
  multiple_faces: 'bg-red-500/20 text-red-300 border-red-500/30',
  looking_away:   'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  phone_detected: 'bg-red-500/20 text-red-300 border-red-500/30',
}

const AdminDashboard = () => {
  const { user }    = useAuth()
  const socketRef   = useRef(null)
  const [students, setStudents]           = useState([])
  const [sessions, setSessions]           = useState([])
  const [realtimeAlerts, setRealtimeAlerts] = useState([])
  const [stats, setStats]                 = useState({ totalStudents: 0, activeSessions: 0, totalAlerts: 0 })
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)

    socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    socketRef.current.on('alert', (event) => {
      setRealtimeAlerts(prev => [
        { ...event, receivedAt: new Date().toLocaleTimeString() },
        ...prev
      ].slice(0, 20))
      setSessions(prev => prev.map(s =>
        s._id === (event.sessionId?._id || event.sessionId)
          ? { ...s, alertCount: (s.alertCount || 0) + 1 }
          : s
      ))
    })

    return () => { clearInterval(interval); socketRef.current?.disconnect() }
  }, [])

  const fetchData = async () => {
    try {
      const [sRes, sessRes] = await Promise.all([
        axios.get('/api/admin/students'),
        axios.get('/api/admin/sessions')
      ])
      setStudents(sRes.data)
      setSessions(sessRes.data)
      const active = sessRes.data.filter(s => s.status === 'active').length
      const alerts = sessRes.data.reduce((sum, s) => sum + (s.alertCount || 0), 0)
      setStats({ totalStudents: sRes.data.length, activeSessions: active, totalAlerts: alerts })
      setLoading(false)
    } catch { setLoading(false) }
  }

  if (loading) return (
    <Layout title="Admin Dashboard">
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  )

  const activeSessions = sessions.filter(s => s.status === 'active')

  return (
    <Layout title="Admin Dashboard" subtitle="Real-time exam monitoring" alertCount={realtimeAlerts.length}>
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={<FaUsers className="text-blue-400" />}             label="Total Students"  value={stats.totalStudents}  color="border-blue-500/30"  bg="bg-blue-500/10" />
          <StatCard icon={<FaClock className="text-green-400" />}            label="Active Sessions" value={stats.activeSessions} color="border-green-500/30" bg="bg-green-500/10" />
          <StatCard icon={<FaExclamationTriangle className="text-red-400" />} label="Total Alerts"   value={stats.totalAlerts}    color="border-red-500/30"   bg="bg-red-500/10" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Active sessions table */}
          <div className="lg:col-span-2 glass p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Active Sessions</h2>
              <span className="badge bg-green-500/20 text-green-300 border border-green-500/30">
                <FaCircle className="text-[8px] animate-pulse" /> {activeSessions.length} live
              </span>
            </div>

            {activeSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <FaCheckCircle className="text-3xl text-green-700 mb-2" />
                <p className="text-sm">No active sessions right now</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-white/10">
                      <th className="pb-3 text-left font-medium">Student</th>
                      <th className="pb-3 text-left font-medium">Exam</th>
                      <th className="pb-3 text-left font-medium">Started</th>
                      <th className="pb-3 text-left font-medium">Alerts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {activeSessions.map(s => (
                        <motion.tr
                          key={s._id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="hover:bg-white/5 transition"
                        >
                          <td className="py-3 pr-4">
                            <p className="font-medium text-white">{s.userId?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{s.userId?.email}</p>
                          </td>
                          <td className="py-3 pr-4 text-slate-300">{s.examName}</td>
                          <td className="py-3 pr-4 text-slate-400 text-xs">{new Date(s.startTime).toLocaleTimeString()}</td>
                          <td className="py-3">
                            <span className={`badge border ${
                              s.alertCount > 5 ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                              s.alertCount > 0 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                              'bg-green-500/20 text-green-300 border-green-500/30'
                            }`}>
                              {s.alertCount || 0}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Live alert feed */}
          <div className="glass overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <FaBell className="text-yellow-400 text-sm" />
              <span className="text-sm font-semibold text-white">Live Alerts</span>
              {realtimeAlerts.length > 0 && (
                <motion.span
                  key={realtimeAlerts.length}
                  initial={{ scale: 1.4 }} animate={{ scale: 1 }}
                  className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold"
                >
                  {realtimeAlerts.length}
                </motion.span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-72">
              <AnimatePresence initial={false}>
                {realtimeAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-sm">
                    <FaCheckCircle className="text-green-700 text-2xl mb-2" />
                    No alerts yet
                  </div>
                ) : realtimeAlerts.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`badge border ${eventColors[a.eventType] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}>
                        {(a.eventType || '').replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-slate-500">{a.receivedAt}</span>
                    </div>
                    <p className="text-slate-400">{a.userId?.name || 'Student'}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* All students */}
        <div className="glass p-5">
          <div className="flex items-center gap-2 mb-4">
            <FaGraduationCap className="text-primary-400" />
            <h2 className="font-semibold text-white">All Students</h2>
            <span className="ml-auto text-xs text-slate-500">{students.length} registered</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-white/10">
                  <th className="pb-3 text-left font-medium">Name</th>
                  <th className="pb-3 text-left font-medium">Email</th>
                  <th className="pb-3 text-left font-medium">Registered</th>
                  <th className="pb-3 text-left font-medium">Sessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map(s => (
                  <tr key={s._id} className="hover:bg-white/5 transition">
                    <td className="py-3 pr-4 font-medium text-white">{s.name}</td>
                    <td className="py-3 pr-4 text-slate-400">{s.email}</td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-slate-400">{sessions.filter(x => x.userId?._id === s._id).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </Layout>
  )
}

export default AdminDashboard
