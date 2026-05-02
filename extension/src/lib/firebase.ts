import { initializeApp, FirebaseApp } from 'firebase/app'
import {
  getAuth,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  connectAuthEmulator,
  User,
  Auth,
} from 'firebase/auth'

// Detect emulator mode: use emulator if no real Firebase config is provided
const hasRealConfig = import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_API_KEY.length > 20 &&
  !import.meta.env.VITE_FIREBASE_API_KEY.startsWith('demo')
const USE_EMULATOR = !hasRealConfig && import.meta.env.VITE_USE_FIREBASE_EMULATOR !== 'false'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-visa-agent.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-visa-agent',
}

let app: FirebaseApp
let auth: Auth
let emulatorConnected = false

export function initFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)

    if (USE_EMULATOR && !emulatorConnected) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
      emulatorConnected = true
      console.log('Connected to Firebase Auth Emulator')
    }
  }
  return { app, auth }
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    initFirebase()
  }
  return auth
}

// Chrome extension OAuth flow using chrome.identity
export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth()

  // In emulator mode, we can't use chrome.identity
  if (USE_EMULATOR) {
    throw new Error('Use signInWithEmail in emulator mode')
  }

  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }

      if (!token) {
        reject(new Error('No token received'))
        return
      }

      try {
        // Create credential from the OAuth token
        const credential = GoogleAuthProvider.credential(null, token)
        const result = await signInWithCredential(auth, credential)
        resolve(result.user)
      } catch (error) {
        // If credential fails, try to remove the cached token and retry
        chrome.identity.removeCachedAuthToken({ token }, () => {
          reject(error)
        })
      }
    })
  })
}

// For emulator testing - sign in with email/password
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth()
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

// For emulator testing - create account with email/password
export async function createAccount(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth()
  const result = await createUserWithEmailAndPassword(auth, email, password)
  return result.user
}

export function isUsingEmulator(): boolean {
  return USE_EMULATOR
}

export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth()

  // Also revoke the Chrome identity token
  try {
    const token = await new Promise<string | undefined>((resolve) => {
      chrome.identity.getAuthToken({ interactive: false }, resolve)
    })

    if (token) {
      await new Promise<void>((resolve) => {
        chrome.identity.removeCachedAuthToken({ token }, resolve)
      })
    }
  } catch (e) {
    // Ignore errors when revoking token
  }

  await firebaseSignOut(auth)
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth()
  return onAuthStateChanged(auth, callback)
}

export async function getIdToken(): Promise<string | null> {
  const auth = getFirebaseAuth()
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}

export function getCurrentUser(): User | null {
  const auth = getFirebaseAuth()
  return auth.currentUser
}
