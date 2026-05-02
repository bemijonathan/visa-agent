import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from 'firebase/auth'
import {
  initFirebase,
  signInWithGoogle as firebaseSignInWithGoogle,
  signInWithEmail as firebaseSignInWithEmail,
  createAccount as firebaseCreateAccount,
  signOut as firebaseSignOut,
  subscribeToAuthState,
  getIdToken,
  isUsingEmulator,
} from '../lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  isEmulatorMode: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  createAccount: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initFirebase()
    const unsubscribe = subscribeToAuthState((user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const isEmulatorMode = isUsingEmulator()

  const signInWithGoogle = async () => {
    await firebaseSignInWithGoogle()
  }

  const signInWithEmail = async (email: string, password: string) => {
    await firebaseSignInWithEmail(email, password)
  }

  const createAccount = async (email: string, password: string) => {
    await firebaseCreateAccount(email, password)
  }

  const signOut = async () => {
    await firebaseSignOut()
  }

  const getToken = async (): Promise<string | null> => {
    return getIdToken()
  }

  return (
    <AuthContext.Provider value={{ user, loading, isEmulatorMode, signInWithGoogle, signInWithEmail, createAccount, signOut, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}
