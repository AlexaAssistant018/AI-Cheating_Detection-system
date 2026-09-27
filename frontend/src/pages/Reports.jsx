import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import axios from 'axios'
import {
  FaFilter, FaExclamationTriangle, FaTimesCircle,
  FaEye, FaSearch, FaDownload, FaSync
} from 'react-icons/fa'

const eventMeta = {
  no_face:        { label: 'No Face',        color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  multiple_faces: { label: 'Multiple Faces', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  looking_away:   { label: 'Looking Away',   color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  phone_detected: { label: 'Phone Detected', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  other:          { label: 'Other',          color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
}

const Reports = () => {
  const { user } = useAuth()
  const [logs, setLogs]               = useState([])
  const [filtered, setFiltered]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [refreshing, setRefreshing]   = useState(false)
  const [filters, setFilters]         = useState({ eventType: 'all', dateFrom: '', dateTo: '', search: '' })

  useEffect(() => { fetchReports() }, [])
  useEffect(() => { applyFilters() }, [filters, logs])

  const fetchReports = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await axios.get('/api/exam/reports')
      setLogs(res.data)
      setFiltered(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false); setRefreshing(false) }
  }

  const applyFilters = () => {
    let f = [...logs]
    if (filters.eventType !== 'all') f = f.filter(l => l.eventType === filters.eventType)
    if (filters.dateFrom) f = f.filter(l => new Date(l.timestamp) >= new Date(filters.dateFrom))
    if (filters.dateTo)   f = f.filter(l => new Date(l.timestamp) <= new Date(filters.dateTo))
    if (filters.search) {
      const q = filters.search.toLowerCase()
      f = f.filter(l =>
        l.description?.toLowerCase().includes(q) ||
        l.userId?.name?.toLowerCase().includes(q) ||
        l.eventType?.toLowerCase().includes(q)
      )
    }
    setFiltered(f)
  }

  const summaryStats = [
    { label: 'Total Events',    value: filtered.length,                                                    color: 'text-white' },
    { label: 'No Face',         value: filtered.filter(l => l.eventType === 'no_face').length,             color: 'text-orange-400' },
    { label: 'Multiple Faces',  value: filtered.filter(l => l.eventType === 'multiple_faces').length,      color: 'text-red-400' },
    { label: 'Looking Away',    value: filtered.filter(l => l.eventType === 'looking_away').length,        color: 'text-yellow-400' },
  ]

  if (loading) return (
    <Layout title="Reports">
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  )

  return (
    <Layout title="Reports" subtitle="Cheating detection event log">
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {summaryStats.map(s => (
            <motion.div key={s.label} whileHover={{ y: -2 }} className="glass p-4 text-center">
              <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass p-5">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-primary-400 text-sm" />
            <span className="text-sm font-semibold text-white">Filters</span>
            <span className="ml-auto text-xs text-slate-500">
              {filtered.length} of {logs.length} events
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input
                type="text" placeholder="Search events, students..."
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                className="input-base pl-9 py-2.5 text-sm"
              />
            </div>

            {/* Event type */}
            <select
              value={filters.eventType}
              onChange={e => setFilters({ ...filters, eventType: e.target.value })}
              className="input-base py-2.5 text-sm"
            >
              <option value="all">All Events</option>
              <option value="no_face">No Face</option>
              <option value="multiple_faces">Multiple Faces</option>
              <option value="looking_away">Looking Away</option>
              <option value="phone_detected">Phone Detected</option>
            </select>

            <input type="date" value={filters.dateFrom}
              onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
              className="input-base py-2.5 text-sm"
            />
            <input type="date" value={filters.dateTo}
              onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
              className="input-base py-2.5 text-sm"
            />
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setFilters({ eventType: 'all', dateFrom: '', dateTo: '', search: '' })}
              className="btn-ghost text-sm py-2"
            >
              Reset
            </button>
            <button
              onClick={() => fetchReports(true)}
              className="btn-ghost text-sm py-2"
            >
              <FaSync className={`text-xs ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="glass overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <FaEye className="text-4xl mb-3 opacity-30" />
              <p>No events match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-white/10">
                    <th className="px-5 py-3 text-left font-medium">Timestamp</th>
                    {user.role === 'admin' && <th className="px-5 py-3 text-left font-medium">Student</th>}
                    <th className="px-5 py-3 text-left font-medium">Event</th>
                    <th className="px-5 py-3 text-left font-medium">Description</th>
                    <th className="px-5 py-3 text-left font-medium">Confidence</th>
                    <th className="px-5 py-3 text-left font-medium">Session</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence initial={false}>
                    {filtered.map((log, i) => {
                      const meta = eventMeta[log.eventType] || eventMeta.other
                      return (
                        <motion.tr
                          key={log._id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="hover:bg-white/5 transition"
                        >
                          <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          {user.role === 'admin' && (
                            <td className="px-5 py-3.5">
                              <p className="font-medium text-white text-xs">{log.userId?.name || '—'}</p>
                              <p className="text-slate-500 text-xs">{log.userId?.email}</p>
                            </td>
                          )}
                          <td className="px-5 py-3.5">
                            <span className={`badge border ${meta.color}`}>{meta.label}</span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-300 max-w-xs truncate">{log.description}</td>
                          <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">
                            {log.confidence != null ? `${Math.round(log.confidence * 100)}%` : '—'}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-xs">
                            {log.sessionId?.examName || '—'}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </Layout>
  )
}

export default Reports
