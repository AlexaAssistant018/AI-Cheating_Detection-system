import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaShieldAlt, FaUserCircle, FaVideo, FaChartBar, FaTachometerAlt } from 'react-icons/fa'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FaShieldAlt className="text-primary-400 text-2xl" />
              <span className="text-xl font-bold text-white">ProctorAI</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <div className="flex items-center space-x-2 mr-2">
                  <FaUserCircle className="text-gray-400 text-xl" />
                  <span className="text-gray-300 text-sm">{user.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.role === 'admin' ? 'bg-purple-700 text-purple-100' : 'bg-blue-700 text-blue-100'
                  }`}>
                    {user.role}
                  </span>
                </div>

                {user.role === 'student' && (
                  <Link
                    to="/student"
                    className="flex items-center gap-1.5 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition"
                  >
                    <FaVideo className="text-xs" /> Live Monitor
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition"
                  >
                    <FaTachometerAlt className="text-xs" /> Dashboard
                  </Link>
                )}

                <Link
                  to="/reports"
                  className="flex items-center gap-1.5 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  <FaChartBar className="text-xs" /> Reports
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition ml-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
