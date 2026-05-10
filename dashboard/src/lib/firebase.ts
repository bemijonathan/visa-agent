import { initializeApp, FirebaseApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  connectAuthEmulator,
  User,
  Auth,
} from 'firebase/auth'

const IS_DEV = import.meta.env.DEV
const USE_EMULATOR = IS_DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR !== 'false'

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
