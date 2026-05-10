import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import type { User } from 'firebase/auth'
import App from './App'
import ErrorBoundary from './ErrorBoundary'
import {
  initFirebase,
  signInWithEmail,
  createAccount,
  signOut,
  subscribeToAuthState,
  getIdToken,
} from '../lib/firebase'
import './index.css'

function AuthWrapper() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingIn, setSigningIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)

  useEffect(() => {
    initFirebase()
    const unsubscribe = subscribeToAuthState((user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSigningIn(true)
    setError('')
    try {
      if (isCreatingAccount) {
        await createAccount(email, password)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setSigningIn(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0a0a0a]">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-[#0a0a0a]">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
          <svg className="w-7 h-7 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        <h1 className="font-display text-xl font-bold text-white mb-2">Visa Agent</h1>
        <p className="text-white/50 text-sm mb-4">Sign in to fill forms and generate letters</p>

        {error && (
          <div className="w-full mb-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="w-full space-y-3 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-amber-500/50"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-amber-500/50"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={signingIn}
            className="w-full px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
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
    )
  }

  return <App getToken={getIdToken} user={user} onSignOut={signOut} />
}

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthWrapper />
    </ErrorBoundary>
  </React.StrictMode>
)
