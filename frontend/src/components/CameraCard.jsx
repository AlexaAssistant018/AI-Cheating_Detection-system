import { useRef, forwardRef } from 'react'
import Webcam from 'react-webcam'
import { motion, AnimatePresence } from 'framer-motion'
import { FaVideo, FaVideoSlash, FaCircle } from 'react-icons/fa'

const statusStyles = {
  idle:           { border: 'border-slate-700',  glow: '',                    label: 'Camera Off',         dot: 'bg-slate-500' },
  monitoring:     { border: 'border-green-500',   glow: 'border-glow-green',   label: 'Monitoring',         dot: 'bg-green-400 animate-pulse' },
  suspicious:     { border: 'border-yellow-500',  glow: 'border-glow-yellow',  label: 'Suspicious Activity',dot: 'bg-yellow-400 animate-pulse' },
  no_face:        { border: 'border-orange-500',  glow: 'border-glow-yellow',  label: 'No Face Detected',   dot: 'bg-orange-400 animate-pulse' },
  multiple_faces: { border: 'border-red-500',     glow: 'border-glow-red animate-glow-red', label: 'Multiple Faces!', dot: 'bg-red-500 animate-pulse' },
}

const CameraCard = forwardRef(({ active, status = 'idle', analyzing, onUserMedia, onUserMediaError }, ref) => {
  const style = statusStyles[status] || statusStyles.idle
  const isAlert = ['multiple_faces', 'no_face', 'suspicious'].includes(status)

  return (
    <div className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-500 ${style.border} ${active ? style.glow : 'border-slate-700'} ${isAlert && active ? 'animate-shake' : ''}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-dark-900/90 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${active ? style.dot : 'bg-slate-600'}`} />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {active ? 'LIVE' : 'STANDBY'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {analyzing && (
            <span className="text-xs text-primary-400 animate-pulse font-medium">● Analyzing</span>
          )}
          {active && (
            <span className={`badge ${
              status === 'monitoring'     ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
              status === 'multiple_faces' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
              status === 'no_face'        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
              status === 'suspicious'     ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
              'bg-slate-500/20 text-slate-300'
            }`}>
              {style.label}
            </span>
          )}
        </div>
      </div>

      {/* Video area */}
      <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key="webcam"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <Webcam
                ref={ref}
                audio={false}
                screenshotFormat="image/jpeg"
                screenshotQuality={0.8}
                onUserMedia={onUserMedia}
                onUserMediaError={onUserMediaError}
                className="w-full h-full object-cover"
                videoConstraints={{ facingMode: 'user', width: 1280, height: 720 }}
              />
              {/* Red overlay flash on alert */}
              {isAlert && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: [0, 0.15, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-red-500 pointer-events-none"
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center gap-4 bg-dark-900"
            >
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
                <FaVideoSlash className="text-slate-600 text-3xl" />
              </div>
              <p className="text-slate-500 text-sm">Camera activates when exam starts</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
})

CameraCard.displayName = 'CameraCard'
export default CameraCard
