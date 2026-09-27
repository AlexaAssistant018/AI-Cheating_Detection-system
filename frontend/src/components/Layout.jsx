import { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const Layout = ({ children, title, subtitle, alertCount }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content — offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          subtitle={subtitle}
          alertCount={alertCount}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
