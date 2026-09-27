import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaShieldAlt, FaVideo, FaBrain, FaChartLine, FaUsers, FaClock, FaArrowRight } from 'react-icons/fa'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay }
})

const Landing = () => {
  const { toggleTheme, isDark } = useTheme()

  return (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-950 text-gray-900 dark:text-white overflow-x-hidden transition-colors duration-200">
    {/* Nav */}
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <FaShieldAlt className="text-white text-sm" />
          </div>
          <span className="font-bold text-lg">ProctorAI</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
          </button>
          <Link to="/login" className="btn-ghost text-sm px-4 py-2">Login</Link>
          <Link to="/signup" className="btn-primary text-sm px-5 py-2.5">Get Started</Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-600/15 dark:bg-primary-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative">
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
          AI-Powered Exam Proctoring
        </motion.div>

        <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          Secure Exams with{' '}
          <span className="text-gradient">Intelligent</span>{' '}
          Monitoring
        </motion.h1>

        <motion.p {...fadeUp(0.2)} className="text-xl text-gray-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Real-time AI detection of cheating attempts. Face recognition, head pose tracking,
          and instant alerts — all in one platform.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/signup" className="btn-primary text-base px-8 py-3.5">
            Start Free <FaArrowRight className="text-sm" />
          </Link>
          <Link to="/login" className="btn-ghost border border-white/20 text-base px-8 py-3.5">
            Sign In
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div {...fadeUp(0.4)} className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[['99%', 'Detection Accuracy'], ['< 3s', 'Alert Response'], ['24/7', 'Monitoring']].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="text-2xl font-bold text-gradient">{v}</p>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">{l}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* Features */}
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-3">Everything you need</h2>
          <p className="text-gray-600 dark:text-slate-400 text-lg">Comprehensive proctoring in one platform</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: <FaVideo />,      title: 'Live Webcam Feed',     desc: 'Real-time camera monitoring with instant face detection and status overlays.' },
            { icon: <FaBrain />,      title: 'AI Detection',         desc: 'OpenCV + MediaPipe detect multiple faces, head pose, and suspicious behavior.' },
            { icon: <FaChartLine />,  title: 'Detailed Reports',     desc: 'Full event logs with timestamps, confidence scores, and filterable analytics.' },
            { icon: <FaShieldAlt />,  title: 'Instant Alerts',       desc: 'Sound alerts and warning modals trigger immediately on suspicious activity.' },
            { icon: <FaUsers />,      title: 'Admin Dashboard',      desc: 'Monitor all students in real-time with live alert feeds and session stats.' },
            { icon: <FaClock />,      title: 'Exam Timer',           desc: 'Built-in countdown timer tracks exam duration from start to finish.' },
          ].map((f, i) => (
            <motion.div key={f.title} {...fadeUp(i * 0.07)}
              whileHover={{ y: -4, scale: 1.01 }}
              className="bg-white dark:bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-white/10 group cursor-default"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-lg mb-4 group-hover:bg-primary-600/30 transition">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="py-20 px-6 bg-gray-100 dark:bg-white/[0.02] border-y border-gray-200 dark:border-white/10">
      <div className="max-w-4xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-3">How it works</h2>
          <p className="text-gray-600 dark:text-slate-400">Up and running in minutes</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { n: '01', title: 'Sign Up',      desc: 'Create your admin account' },
            { n: '02', title: 'Start Exam',   desc: 'Click Start — camera activates automatically' },
            { n: '03', title: 'AI Monitors',  desc: 'Detection runs every 3 seconds in background' },
            { n: '04', title: 'View Reports', desc: 'Access full logs and analytics anytime' },
          ].map((s, i) => (
            <motion.div key={s.n} {...fadeUp(i * 0.1)} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold font-mono text-lg mx-auto mb-4">
                {s.n}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{s.title}</h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
      <motion.div {...fadeUp()} className="relative max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold mb-4">Ready to secure your exams?</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-8 text-lg">Join universities using ProctorAI for fair, secure online examinations.</p>
        <Link to="/signup" className="btn-primary text-base px-10 py-4 inline-flex">
          Get Started Free <FaArrowRight className="text-sm" />
        </Link>
      </motion.div>
    </section>

    {/* Footer */}
    <footer className="border-t border-gray-200 dark:border-white/10 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FaShieldAlt className="text-primary-400" />
          <span className="font-bold text-gray-900 dark:text-white">ProctorAI</span>
          <span className="text-gray-500 dark:text-slate-500 text-sm ml-2">© 2025</span>
        </div>
        <p className="text-gray-500 dark:text-slate-500 text-sm">AI-Based Cheating Detection System — Final Year Project</p>
      </div>
    </footer>
  </div>
)
}

export default Landing
