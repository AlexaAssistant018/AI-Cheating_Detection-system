import { useState, useEffect } from 'react'
import { FiSearch, FiFilter, FiDownload, FiCalendar, FiAlertTriangle } from 'react-icons/fi'
import { motion } from 'framer-motion'

const ReportsAdmin = () => {
  const [reports, setReports] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [dateRange, setDateRange] = useState('today')

  useEffect(() => {
    // Mock reports data
    const mockReports = [
      {
        id: 1,
        student: 'John Doe',
        eventType: 'Multiple Faces',
        description: '2 faces detected in frame',
        timestamp: '2024-01-15 10:23:45',
        severity: 'high',
        sessionId: 'SES001'
      },
      {
        id: 2,
        student: 'Jane Smith',
        eventType: 'No Face Detected',
        description: 'Student left the frame',
        timestamp: '2024-01-15 10:18:30',
        severity: 'medium',
        sessionId: 'SES002'
      },
      {
        id: 3,
        student: 'Mike Johnson',
        eventType: 'Looking Away',
        description: 'Student looking at different direction',
        timestamp: '2024-01-15 10:15:12',
        severity: 'low',
        sessionId: 'SES003'
      },
      {
        id: 4,
        student: 'Sarah Williams',
        eventType: 'Phone Detected',
        description: 'Mobile device detected in frame',
        timestamp: '2024-01-15 10:12:05',
        severity: 'high',
        sessionId: 'SES004'
      },
      {
        id: 5,
        student: 'David Brown',
        eventType: 'Multiple Faces',
        description: '3 faces detected in frame',
        timestamp: '2024-01-15 10:08:22',
        severity: 'high',
        sessionId: 'SES005'
      },
      {
        id: 6,
        student: 'Emily Davis',
        eventType: 'Looking Away',
        description: 'Suspicious head movement',
        timestamp: '2024-01-15 10:05:40',
        severity: 'medium',
        sessionId: 'SES006'
      },
    ]
    setReports(mockReports)
  }, [])

  const eventTypes = ['all', 'Multiple Faces', 'No Face Detected', 'Looking Away', 'Phone Detected']

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800'
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.eventType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || report.eventType === filterType
    return matchesSearch && matchesFilter
  })

  const handleExport = () => {
    alert('Export functionality coming soon!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">View and analyze cheating detection logs</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          <FiDownload />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search student or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Event Type Filter */}
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none"
            >
              {eventTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Events' : type}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Incidents', value: filteredReports.length, color: 'blue' },
          { label: 'High Severity', value: filteredReports.filter(r => r.severity === 'high').length, color: 'red' },
          { label: 'Medium Severity', value: filteredReports.filter(r => r.severity === 'medium').length, color: 'yellow' },
          { label: 'Low Severity', value: filteredReports.filter(r => r.severity === 'low').length, color: 'green' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-dark-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Session ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReports.map((report, index) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          {report.student.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {report.student}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FiAlertTriangle className="text-orange-500" />
                      <span className="text-sm text-gray-900 dark:text-white">{report.eventType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{report.description}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(report.severity)}`}>
                      {report.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {report.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{report.sessionId}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FiAlertTriangle className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No reports found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportsAdmin
