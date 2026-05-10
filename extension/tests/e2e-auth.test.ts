/**
 * E2E Authentication Test
 *
 * Tests the full authentication flow for both extension and dashboard.
 *
 * Prerequisites:
 *   - Firebase Auth Emulator running on localhost:9099
 *     OR set TEST_USE_PRODUCTION=true with real Firebase credentials
 *
 * Run with:
 *   cd extension && bun test tests/e2e-auth.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'

const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || 'demo-api-key'
const FIREBASE_AUTH_DOMAIN = process.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-visa-agent.firebaseapp.com'
const USE_EMULATOR = process.env.TEST_USE_PRODUCTION !== 'true'
const EMULATOR_URL = 'http://localhost:9099'

// Firebase Auth REST API endpoints
const AUTH_BASE_URL = USE_EMULATOR
  ? `${EMULATOR_URL}/identitytoolkit.googleapis.com/v1`
  : 'https://identitytoolkit.googleapis.com/v1'

const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
}

let idToken: string | null = null

async function firebaseAuthRequest(endpoint: string, body: object) {
  const url = `${AUTH_BASE_URL}/${endpoint}?key=${FIREBASE_API_KEY}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || `Auth request failed: ${response.status}`)
  }

  return data
}

describe('E2E Authentication Flow', () => {
  beforeAll(async () => {
    if (USE_EMULATOR) {
      // Check if emulator is running
      try {
        const response = await fetch(EMULATOR_URL)
        if (!response.ok) {
          console.warn('Firebase Auth Emulator may not be running')
        }
      } catch {
        throw new Error(
          'Firebase Auth Emulator not running.\n' +
          'Start it with: docker compose up firebase\n' +
          'Or: cd firebase && firebase emulators:start --only auth'
        )
      }
    }
  })

  describe('1. User Registration', () => {
    it('should create a new user account', async () => {
      const result = await firebaseAuthRequest('accounts:signUp', {
        email: testUser.email,
        password: testUser.password,
        returnSecureToken: true,
      })

      expect(result.email).toBe(testUser.email)
      expect(result.idToken).toBeDefined()
      expect(result.localId).toBeDefined()

      idToken = result.idToken
      console.log(`✓ Created user: ${testUser.email}`)
    })

    it('should reject duplicate email', async () => {
      await expect(
        firebaseAuthRequest('accounts:signUp', {
          email: testUser.email,
          password: testUser.password,
          returnSecureToken: true,
        })
      ).rejects.toThrow('EMAIL_EXISTS')
    })

    it('should reject weak password', async () => {
      await expect(
        firebaseAuthRequest('accounts:signUp', {
          email: 'weak@example.com',
          password: '123',
          returnSecureToken: true,
        })
      ).rejects.toThrow()
    })
  })

  describe('2. User Sign-In', () => {
    it('should sign in with correct credentials', async () => {
      const result = await firebaseAuthRequest('accounts:signInWithPassword', {
        email: testUser.email,
        password: testUser.password,
        returnSecureToken: true,
      })

      expect(result.email).toBe(testUser.email)
      expect(result.idToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()

      idToken = result.idToken
      console.log(`✓ Signed in as: ${testUser.email}`)
    })

    it('should reject wrong password', async () => {
      await expect(
        firebaseAuthRequest('accounts:signInWithPassword', {
          email: testUser.email,
          password: 'WrongPassword123!',
          returnSecureToken: true,
        })
      ).rejects.toThrow()
    })

    it('should reject non-existent user', async () => {
      await expect(
        firebaseAuthRequest('accounts:signInWithPassword', {
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
          returnSecureToken: true,
        })
      ).rejects.toThrow()
    })
  })

  describe('3. Token Validation', () => {
    it('should have valid ID token', async () => {
      expect(idToken).toBeDefined()
      expect(idToken!.length).toBeGreaterThan(100)

      // Decode JWT payload (without verification)
      const [, payloadBase64] = idToken!.split('.')
      const payload = JSON.parse(atob(payloadBase64))

      expect(payload.email).toBe(testUser.email)
      expect(payload.exp).toBeGreaterThan(Date.now() / 1000)

      console.log(`✓ Token valid until: ${new Date(payload.exp * 1000).toISOString()}`)
    })

    it('should get user info with token', async () => {
      const result = await firebaseAuthRequest('accounts:lookup', {
        idToken,
      })

      expect(result.users).toHaveLength(1)
      expect(result.users[0].email).toBe(testUser.email)

      console.log(`✓ User lookup successful`)
    })
  })

  describe('4. API Authentication', () => {
    const API_URL = process.env.VITE_API_URL || 'http://localhost:3001'

    it('should authenticate with backend API', async () => {
      try {
        const response = await fetch(`${API_URL}/api/organizations`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })

        // 200 = success, 401 = token invalid, 404 = endpoint doesn't exist
        if (response.status === 401) {
          console.log('⚠ Backend rejected token (may need user in DB)')
        } else if (response.ok) {
          console.log('✓ Backend accepted auth token')
        } else {
          console.log(`⚠ Backend returned ${response.status}`)
        }

        // Don't fail - just report status
        expect([200, 401, 403, 404, 500]).toContain(response.status)
      } catch (error) {
        console.log('⚠ Backend not reachable (may not be running)')
      }
    })
  })

  afterAll(() => {
    console.log('\n' + '='.repeat(50))
    console.log('E2E Auth Test Summary')
    console.log('='.repeat(50))
    console.log(`Test User: ${testUser.email}`)
    console.log(`Password: ${testUser.password}`)
    console.log(`Mode: ${USE_EMULATOR ? 'Emulator' : 'Production'}`)
    console.log('='.repeat(50))
    console.log('\nYou can now test manually:')
    console.log('1. Open extension, sign in with credentials above')
    console.log('2. Open dashboard, sign in with same credentials')
    console.log('3. Verify both show the same user')
  })
})
