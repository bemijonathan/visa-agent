import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Globe, Check, X, Clock, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../contexts/OrganizationContext'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '')

interface InvitationDetails {
  email: string
  organizationName: string
  organizationSlug: string
  invitedBy: string
  role: string
  status: string
  expiresAt: string
}

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading, signInWithEmail, createAccount, getToken } = useAuth()
  const { refreshOrganizations } = useOrganization()

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [signingIn, setSigningIn] = useState(false)

  // Fetch invitation details
  useEffect(() => {
    async function fetchInvitation() {
      if (!token) return

      try {
        const res = await fetch(`${API_URL}/api/organizations/invitations/${token}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Invitation not found')
          return
        }

        setInvitation(data)
      } catch (err) {
        setError('Failed to load invitation')
      } finally {
        setLoading(false)
      }
    }

    fetchInvitation()
  }, [token])

  // Accept invitation
  async function handleAccept() {
    if (!token || !user) return

    setAccepting(true)
    setError(null)

    try {
      const idToken = await getToken()
      const res = await fetch(`${API_URL}/api/organizations/invitations/${token}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to accept invitation')
        return
      }

      setSuccess(true)

      // Refresh organizations and switch to the new one
      await refreshOrganizations()

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/app')
      }, 2000)
    } catch (err) {
      setError('Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  // Handle sign in then accept
  async function handleSignInAndAccept(e: React.FormEvent) {
    e.preventDefault()
    setSigningIn(true)
    setError(null)
    try {
      if (isCreatingAccount) {
        await createAccount(email, password)
      } else {
        await signInWithEmail(email, password)
      }
      // After sign in, the useEffect will refetch and we can accept
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setSigningIn(false)
    }
  }

  // Auto-accept if user is signed in and email matches
  useEffect(() => {
    if (user && invitation && invitation.status === 'PENDING' && !success && !accepting) {
      if (user.email?.toLowerCase() === invitation.email.toLowerCase()) {
        handleAccept()
      }
    }
  }, [user, invitation])

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isExpired = invitation?.status === 'EXPIRED'
  const isAccepted = invitation?.status === 'ACCEPTED' || success
  const isCancelled = invitation?.status === 'CANCELLED'
  const emailMismatch = user && invitation && user.email?.toLowerCase() !== invitation.email.toLowerCase()

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

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Globe className="w-6 h-6 text-black" />
          </div>
          <span className="font-display text-2xl font-bold text-white">Visa Agent</span>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          {error && !invitation ? (
            // Invitation not found
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="font-display text-xl font-bold text-white mb-2">Invitation Not Found</h1>
              <p className="text-white/50 text-sm mb-6">
                {error}
              </p>
              <Link
                to="/"
                className="inline-flex px-6 py-3 bg-white/10 rounded-xl text-white font-medium hover:bg-white/20 transition-colors"
              >
                Go to Homepage
              </Link>
            </div>
          ) : isExpired ? (
            // Expired
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-amber-400" />
              </div>
              <h1 className="font-display text-xl font-bold text-white mb-2">Invitation Expired</h1>
              <p className="text-white/50 text-sm mb-6">
                This invitation to join <span className="text-white">{invitation?.organizationName}</span> has expired.
                Please ask the team admin to send a new invitation.
              </p>
              <Link
                to="/"
                className="inline-flex px-6 py-3 bg-white/10 rounded-xl text-white font-medium hover:bg-white/20 transition-colors"
              >
                Go to Homepage
              </Link>
            </div>
          ) : isCancelled ? (
            // Cancelled
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="font-display text-xl font-bold text-white mb-2">Invitation Cancelled</h1>
              <p className="text-white/50 text-sm mb-6">
                This invitation has been cancelled by the organization admin.
              </p>
              <Link
                to="/"
                className="inline-flex px-6 py-3 bg-white/10 rounded-xl text-white font-medium hover:bg-white/20 transition-colors"
              >
                Go to Homepage
              </Link>
            </div>
          ) : isAccepted ? (
            // Success
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="font-display text-xl font-bold text-white mb-2">Welcome!</h1>
              <p className="text-white/50 text-sm mb-6">
                You've joined <span className="text-white">{invitation?.organizationName}</span>.
                Redirecting to dashboard...
              </p>
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : emailMismatch ? (
            // Wrong account
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-400" />
              </div>
              <h1 className="font-display text-xl font-bold text-white mb-2">Wrong Account</h1>
              <p className="text-white/50 text-sm mb-4">
                This invitation was sent to <span className="text-white">{invitation?.email}</span>.
              </p>
              <p className="text-white/50 text-sm mb-6">
                You're signed in as <span className="text-white">{user?.email}</span>.
                Please sign in with the correct email address.
              </p>
              {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
              )}
            </div>
          ) : !user ? (
            // Sign in required
            <div className="text-center">
              <h1 className="font-display text-xl font-bold text-white mb-2">You're Invited!</h1>
              <p className="text-white/50 text-sm mb-2">
                <span className="text-white">{invitation?.invitedBy}</span> has invited you to join
              </p>
              <p className="text-amber-400 font-semibold text-lg mb-1">{invitation?.organizationName}</p>
              <p className="text-white/40 text-xs mb-6">as {invitation?.role}</p>

              <p className="text-white/50 text-sm mb-4">
                Sign in with <span className="text-white">{invitation?.email}</span> to accept this invitation.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignInAndAccept} className="space-y-3 mb-4">
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
                  disabled={signingIn}
                  className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-black font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {signingIn ? 'Please wait...' : isCreatingAccount ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <button
                onClick={() => setIsCreatingAccount(!isCreatingAccount)}
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                {isCreatingAccount ? 'Already have an account? Sign in' : 'Need an account? Create one'}
              </button>
            </div>
          ) : (
            // Accepting
            <div className="text-center">
              <h1 className="font-display text-xl font-bold text-white mb-2">Joining...</h1>
              <p className="text-white/50 text-sm mb-6">
                Accepting invitation to {invitation?.organizationName}
              </p>
              {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
              )}
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
