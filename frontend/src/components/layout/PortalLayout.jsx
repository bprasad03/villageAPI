import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const links = [
  { to: '/portal/dashboard', icon: '📊', label: 'Dashboard'   },
  { to: '/portal/keys',      icon: '🔑', label: 'API Keys'    },
  { to: '/portal/docs',      icon: '📖', label: 'Docs'        },
]

const planColors = {
  FREE:      'bg-gray-100 text-gray-600',
  PREMIUM:   'bg-blue-100 text-blue-700',
  PRO:       'bg-purple-100 text-purple-700',
  UNLIMITED: 'bg-green-100 text-green-700',
}

export default function PortalLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full">

        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🌍</span>
            <span className="font-bold text-gray-900">VillageAPI</span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-100">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="font-medium text-gray-900 text-sm truncate">
              {user?.businessName}
            </p>
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {user?.email}
            </p>
            <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${planColors[user?.plan || 'FREE']}`}>
              {user?.plan || 'FREE'} plan
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-1">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Rate limit bar */}
        <div className="p-4 border-t border-gray-100">
          <div className="mb-2 flex justify-between text-xs text-gray-500">
            <span>Daily usage</span>
            <span>0 / {user?.plan === 'FREE' ? '5,000' : user?.plan === 'PREMIUM' ? '50,000' : '300,000'}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '2%' }}></div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  )
}