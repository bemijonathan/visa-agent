import { Context, Next } from 'hono'
import { initializeApp, cert, getApps, App, applicationDefault } from 'firebase-admin/app'
import { getAuth, DecodedIdToken } from 'firebase-admin/auth'

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const DEV_FIREBASE_UID = 'dev-user'
const USE_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST !== undefined
const IS_DEV_MODE =
  !IS_PRODUCTION &&
  !USE_EMULATOR &&
  (!process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT === '{}')

// Initialize Firebase Admin SDK
let firebaseApp: App | undefined

function getFirebaseApp(): App {
  if (firebaseApp) return firebaseApp

  const existingApps = getApps()
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0]
    return firebaseApp
  }

  // When using emulator, we can initialize without credentials
  if (USE_EMULATOR) {
    firebaseApp = initializeApp({
      projectId: 'demo-visa-agent',
    })
    console.log('Firebase Admin initialized with emulator')
    return firebaseApp
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set')
  }

  const serviceAccount = JSON.parse(serviceAccountJson)
  firebaseApp = initializeApp({
    credential: cert(serviceAccount),
  })

  return firebaseApp
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing authorization header' }, 401)
  }

  const token = authHeader.slice(7)

  // Allow dev-token bypass only in non-production when Firebase is not configured
  if (IS_DEV_MODE && token === 'dev-token') {
    c.set('firebaseUid', DEV_FIREBASE_UID)
    c.set('userEmail', 'dev@example.com')
    await next()
    return
  }

  try {
    const app = getFirebaseApp()
    const auth = getAuth(app)
    const decodedToken: DecodedIdToken = await auth.verifyIdToken(token)

    c.set('firebaseUid', decodedToken.uid)
    c.set('userEmail', decodedToken.email || null)
    c.set('userName', decodedToken.name || null)
    c.set('userPicture', decodedToken.picture || null)

    await next()
  } catch (error) {
    console.error('Auth error:', error)
    return c.json({ error: 'Invalid token' }, 401)
  }
}

export function getFirebaseUid(c: Context): string {
  return c.get('firebaseUid')
}

export function getUserEmail(c: Context): string | null {
  return c.get('userEmail')
}

export function getUserName(c: Context): string | null {
  return c.get('userName')
}

export function getUserPicture(c: Context): string | null {
  return c.get('userPicture')
}
