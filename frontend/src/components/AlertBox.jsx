import { motion, AnimatePresence } from 'framer-motion'
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaEye } from 'react-icons/fa'

const typeConfig = {
  no_face:        { icon: <FaEye />,               color: 'border-orange-500/40 bg-orange-500/10 text-orange-300',  dot: 'bg-orange-400' },
  multiple_faces: { icon: <FaTimesCircle />,        color: 'border-red-500/40 bg-red-500/10 text-red-300',           dot: 'bg-red-500' },
  looking_away:   { icon: <FaExclamationTriangle />,color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',  dot: 'bg-yellow-400' },
  phone_detected: { icon: <FaTimesCircle />,        color: 'border-red-500/40 bg-red-500/10 text-red-300',           dot: 'bg-red-500' },
  other:          { icon: <FaExclamationTriangle />,color: 'border-slate-500/40 bg-slate-500/10 text-slate-300',     dot: 'bg-slate-400' },
}

const AlertBox = ({ alerts }) => {
  return (
    <div className="glass flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <FaBell className="text-yellow-400 text-sm" />
        <span className="text-sm font-semibold text-white">Alert Log</span>
        {alerts.length > 0 && (
          <motion.span
            key={alerts.length}
            initial={{ scale: 1.4 }} animate={{ scale: 1 }}
            className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold"
          >
            {alerts.length}
          </motion.span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence initial={false}>
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 text-slate-500"
            >
              <FaCheckCircle className="text-green-600 text-3xl mb-2" />
              <p className="text-sm">No alerts detected</p>
            </motion.div>
          ) : (
            alerts.map(alert => {
              const cfg = typeConfig[alert.eventType] || typeConfig.other
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`alert-item border ${cfg.color}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs uppercase tracking-wide">
                          {alert.eventType.replace(/_/g, ' ')}
                          {alert.confidence && (
                            <span className="ml-1 opacity-60 normal-case font-normal">
                              {Math.round(alert.confidence * 100)}%
                            </span>
                          )}
                        </span>
                        <span className="text-xs opacity-50 whitespace-nowrap flex-shrink-0">{alert.time}</span>
                      </div>
                      {alert.description && (
                        <p className="text-xs opacity-70 mt-0.5 truncate">{alert.description}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AlertBox
