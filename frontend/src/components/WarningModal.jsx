import { motion, AnimatePresence } from 'framer-motion'
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa'

const WarningModal = ({ show, title, message, onClose }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative z-10 w-full max-w-sm bg-dark-800 border border-red-500/50 rounded-2xl p-6 shadow-2xl shadow-red-500/20"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
          >
            <FaTimes />
          </button>

          <div className="flex flex-col items-center text-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, repeat: 3 }}
              className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center"
            >
              <FaExclamationTriangle className="text-red-400 text-2xl" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-slate-400 text-sm mt-1">{message}</p>
            </div>
            <button onClick={onClose} className="btn-danger w-full mt-2">
              Dismiss
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

export default WarningModal
