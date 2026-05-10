import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { Globe, ArrowLeft } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { useOrganization } from './contexts/OrganizationContext'
import { setCurrentOrganizationId } from './lib/api'
import ClientList from './pages/ClientList'
import NewClient from './pages/NewClient'
import ClientDetail from './pages/ClientDetail'
import HomePage from './pages/HomePage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ContactPage from './pages/ContactPage'
import AcceptInvite from './pages/AcceptInvite'
import OrgSettings from './pages/OrgSettings'
import NewOrganization from './pages/NewOrganization'
import LetterEditor from './pages/LetterEditor'
import DashboardLayout from './components/DashboardLayout'

function ProtectedRoute({ children, noLayout }: { children: React.ReactNode; noLayout?: boolean }) {
  const { user, loading: authLoading } = useAuth()
  const { currentOrganization, loading: orgLoading } = useOrganization()

  // Sync current org ID to API module
  useEffect(() => {
    setCurrentOrganizationId(currentOrganization?.id || null)
  }, [currentOrganization?.id])

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (noLayout) {
    return <>{children}</>
  }

  return <DashboardLayout>{children}</DashboardLayout>
}

function LoginPage() {
  const { signInWithEmail, createAccount, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (isCreatingAccount) {
        await createAccount(email, password)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (err) {
      console.error('Email auth error:', err)
      setError(err instanceof Error ? err.message : 'Authentication failed')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Back to home */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to home</span>
      </Link>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Globe className="w-6 h-6 text-black" />
          </div>
          <span className="font-display text-2xl font-bold text-white">Visa Agent</span>
        </div>

        {/* Sign in container */}
        <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          <h1 className="font-display text-xl font-bold text-white text-center mb-2">Welcome back</h1>
          <p className="text-white/50 text-sm text-center mb-6">Sign in to access your dashboard</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4 mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50"
              required
              minLength={6}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-black font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isCreatingAccount ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <button
            onClick={() => setIsCreatingAccount(!isCreatingAccount)}
            className="w-full text-sm text-white/50 hover:text-white transition-colors"
          >
            {isCreatingAccount ? 'Already have an account? Sign in' : 'Need an account? Create one'}
          </button>
        </div>

        {/* Footer text */}
        <p className="text-center text-white/30 text-xs mt-6">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-white/50 hover:text-white underline">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-white/50 hover:text-white underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public homepage */}
      <Route
        path="/"
        element={
          user ? <Navigate to="/app" replace /> : <HomePage />
        }
      />

      {/* Login page */}
      <Route
        path="/login"
        element={
          user ? <Navigate to="/app" replace /> : <LoginPage />
        }
      />

      {/* Privacy policy (public) */}
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* Terms of service (public) */}
      <Route path="/terms" element={<TermsPage />} />

      {/* Contact page (public) */}
      <Route path="/contact" element={<ContactPage />} />

      {/* Accept invitation (public, handles auth internally) */}
      <Route path="/invite/:token" element={<AcceptInvite />} />

      {/* Protected routes */}
      <Route path="/app" element={<ProtectedRoute><ClientList /></ProtectedRoute>} />
      <Route path="/clients/new" element={<ProtectedRoute><NewClient /></ProtectedRoute>} />
      <Route path="/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
      <Route path="/letters/:id" element={<ProtectedRoute noLayout><LetterEditor /></ProtectedRoute>} />
      <Route path="/organizations/settings" element={<ProtectedRoute><OrgSettings /></ProtectedRoute>} />
      <Route path="/organizations/new" element={<ProtectedRoute noLayout><NewOrganization /></ProtectedRoute>} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
