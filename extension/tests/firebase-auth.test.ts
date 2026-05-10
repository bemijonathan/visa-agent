import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'

/**
 * Firebase Auth Integration Tests
 *
 * These tests verify Firebase auth works correctly with the web-extension build.
 * Requires Firebase Auth Emulator running on localhost:9099.
 *
 * To run:
 *   1. Start emulator: firebase emulators:start --only auth
 *   2. Run tests: npm test
 */

// Mock chrome.identity API for Node.js environment
const mockChrome = {
  identity: {
    getAuthToken: (_opts: unknown, callback: (token?: string) => void) => {
      callback(undefined)
    },
    removeCachedAuthToken: (_opts: unknown, callback: () => void) => {
      callback()
    },
  },
  runtime: {
    lastError: undefined as { message: string } | undefined,
  },
}

// @ts-expect-error - Mocking chrome global for tests
globalThis.chrome = mockChrome

// Dynamic import after chrome mock is set up
let firebaseAuth: typeof import('../src/lib/firebase')

describe('Firebase Auth Integration', () => {
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'testPassword123!'

  beforeAll(async () => {
    // Check if emulator is running
    try {
      const response = await fetch('http://localhost:9099/')
      if (!response.ok) {
        console.warn('Firebase Auth Emulator may not be running on localhost:9099')
      }
    } catch {
      console.warn(
        'Firebase Auth Emulator not reachable. Some tests may fail.\n' +
        'Start it with: firebase emulators:start --only auth'
      )
    }

    // Import after chrome mock
    firebaseAuth = await import('../src/lib/firebase')
  })

  beforeEach(() => {
    // Reset chrome mock state
    mockChrome.runtime.lastError = undefined
  })

  describe('Module Initialization', () => {
    it('should initialize Firebase without errors', () => {
      expect(() => firebaseAuth.initFirebase()).not.toThrow()
    })

    it('should return auth instance', () => {
      const auth = firebaseAuth.getFirebaseAuth()
      expect(auth).toBeDefined()
      expect(auth).toHaveProperty('currentUser')
    })

    it('should detect emulator mode', () => {
      // With demo config, should be in emulator mode
      expect(firebaseAuth.isUsingEmulator()).toBe(true)
    })
  })

  describe('Email/Password Auth (Emulator)', () => {
    it('should create account with email/password', async () => {
      const user = await firebaseAuth.createAccount(testEmail, testPassword)

      expect(user).toBeDefined()
      expect(user.email).toBe(testEmail)
      expect(user.uid).toBeDefined()
    })

    it('should sign in with email/password', async () => {
      const user = await firebaseAuth.signInWithEmail(testEmail, testPassword)

      expect(user).toBeDefined()
      expect(user.email).toBe(testEmail)
    })

    it('should get current user after sign in', () => {
      const user = firebaseAuth.getCurrentUser()

      expect(user).toBeDefined()
      expect(user?.email).toBe(testEmail)
    })

    it('should get ID token for authenticated user', async () => {
      const token = await firebaseAuth.getIdToken()

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token!.length).toBeGreaterThan(0)
    })

    it('should sign out successfully', async () => {
      await firebaseAuth.signOut()

      const user = firebaseAuth.getCurrentUser()
      expect(user).toBeNull()
    })

    it('should return null token when not authenticated', async () => {
      const token = await firebaseAuth.getIdToken()
      expect(token).toBeNull()
    })
  })

  describe('Auth State Subscription', () => {
    it('should notify on auth state changes', async () => {
      const states: (string | null)[] = []

      const unsubscribe = firebaseAuth.subscribeToAuthState((user) => {
        states.push(user?.email ?? null)
      })

      // Sign in and wait for state update
      await firebaseAuth.signInWithEmail(testEmail, testPassword)
      await new Promise(resolve => setTimeout(resolve, 100))

      // Sign out and wait for state update
      await firebaseAuth.signOut()
      await new Promise(resolve => setTimeout(resolve, 100))

      unsubscribe()

      // Should have captured auth state changes
      expect(states).toContain(testEmail)
      expect(states).toContain(null)
    })
  })

  describe('Google Sign In (Chrome Identity)', () => {
    it('should throw in emulator mode', async () => {
      await expect(firebaseAuth.signInWithGoogle()).rejects.toThrow(
        'Use signInWithEmail in emulator mode'
      )
    })
  })

  describe('Error Handling', () => {
    it('should reject invalid credentials', async () => {
      await expect(
        firebaseAuth.signInWithEmail('nonexistent@example.com', 'wrongpassword')
      ).rejects.toThrow()
    })

    it('should reject weak passwords on account creation', async () => {
      await expect(
        firebaseAuth.createAccount('weak@example.com', '123')
      ).rejects.toThrow()
    })

    it('should reject duplicate account creation', async () => {
      await expect(
        firebaseAuth.createAccount(testEmail, testPassword)
      ).rejects.toThrow()
    })
  })

  afterAll(async () => {
    // Clean up - sign out if still signed in
    try {
      await firebaseAuth.signOut()
    } catch {
      // Ignore
    }
  })
})
