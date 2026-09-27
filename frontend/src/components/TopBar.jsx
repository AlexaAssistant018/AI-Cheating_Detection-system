import { FaBars, FaShieldAlt, FaBell } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const TopBar = ({ onMenuClick, title, subtitle, alertCount = 0 }) => {
  const { user } = useAuth()

  return (
    <header className="h-16 bg-dark-900/80 backdrop-blur-md border-b border-white/10 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-20">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
      >
        <FaBars />
      </button>

      {/* Mobile logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <FaShieldAlt className="text-primary-400" />
        <span className="font-bold text-white">ProctorAI</span>
      </div>

      {/* Page title */}
      <div className="hidden lg:block">
        <h1 className="text-lg font-bold text-white leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition">
          <FaBell />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  )
}

export default TopBar
