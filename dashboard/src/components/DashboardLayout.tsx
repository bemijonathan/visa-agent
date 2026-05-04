import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Globe,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  X,
  Download
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../contexts/OrganizationContext'
import { useExtensionDetection } from '../hooks/useExtensionDetection'
import OrgSwitcher from './OrgSwitcher'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { currentOrganization } = useOrganization()
  const { showBanner, dismissBanner } = useExtensionDetection()
  const [collapsed, setCollapsed] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    { to: '/app', icon: Users, label: 'Clients' },
    { to: '/organizations/settings', icon: Building2, label: 'Organization' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-20 flex flex-col bg-[#0a0a0a]/95 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Globe className="w-5 h-5 text-black" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="font-display text-lg font-bold text-white">Visa Agent</h1>
                <p className="text-xs text-white/40">Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Org Switcher */}
        {!collapsed && currentOrganization && (
          <div className="p-4 border-b border-white/5">
            <OrgSwitcher />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-white/5">
          {/* User Info */}
          <div className={`flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-white/[0.02] ${collapsed ? 'justify-center' : ''}`}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-amber-400" />
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-white/40 truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Sign out</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Extension Banner */}
        {showBanner && (
          <div className="bg-red-600 text-white px-4 py-3 relative z-30">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">
                  <span className="font-semibold">Chrome Extension not detected.</span>
                  {' '}Install the Visa Agent extension to auto-fill forms on visa portals.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href="https://chrome.google.com/webstore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 bg-white text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
                >
                  Install Extension
                </a>
                <button
                  onClick={dismissBanner}
                  className="p-1 hover:bg-red-700 rounded transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
