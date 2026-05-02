import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { User } from 'firebase/auth'
import App from './App'
import ErrorBoundary from './ErrorBoundary'
import {
  initFirebase,
  signInWithGoogle,
  signInWithEmail,
  signOut,
  subscribeToAuthState,
  getIdToken,
  isUsingEmulator,
} from '../lib/firebase'
import './index.css'

function AuthWrapper() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingIn, setSigningIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const emulatorMode = isUsingEmulator()

  useEffect(() => {
    initFirebase()
    const unsubscribe = subscribeToAuthState((user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const handleSignIn = async () => {
    setSigningIn(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
      setError(error instanceof Error ? error.message : 'Sign in failed')
    } finally {
      setSigningIn(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSigningIn(true)
    setError('')
    try {
      await signInWithEmail(email, password)
    } catch (error) {
      console.error('Sign in error:', error)
      setError(error instanceof Error ? error.message : 'Sign in failed')
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

        {emulatorMode && (
          <>
            <div className="w-full mb-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs">
              Emulator Mode
            </div>
            <form onSubmit={handleEmailSignIn} className="w-full space-y-3 mb-4">
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
                {signingIn ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </>
        )}

        {!emulatorMode && (
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors disabled:opacity-50 w-full"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {signingIn ? 'Signing in...' : 'Sign in with Google'}
          </button>
        )}
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
