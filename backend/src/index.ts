import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/bun'
import { rateLimiter } from 'hono-rate-limiter'
import { agentRoutes } from './routes/agent.js'
import { profileRoutes } from './routes/profiles.js'
import { documentRoutes } from './routes/documents.js'
import { letterRoutes } from './routes/letters.js'
import { organizationRoutes } from './routes/organizations.js'

const app = new Hono()

// Middleware
app.use('*', logger())
const ALLOWED_EXTENSION_ID = process.env.CHROME_EXTENSION_ID // e.g. "abcdefghijklmnop"
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:5173'

app.use('*', cors({
  origin: (origin) => {
    if (!origin) return origin // same-origin / server-to-server
    if (origin.startsWith('http://localhost') || origin.startsWith('https://localhost')) return origin
    if (ALLOWED_EXTENSION_ID && origin === `chrome-extension://${ALLOWED_EXTENSION_ID}`) return origin
    if (!ALLOWED_EXTENSION_ID && origin.startsWith('chrome-extension://')) return origin // dev fallback
    if (origin === DASHBOARD_URL) return origin
    return null
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Organization-ID'],
  credentials: true,
}))

// Rate limiting — 30 req/min on agent endpoints (Gemini calls are expensive)
const agentRateLimit = rateLimiter({
  windowMs: 60_000,
  limit: 30,
  keyGenerator: (c) => c.req.header('Authorization')?.slice(7, 30) ?? c.req.header('x-forwarded-for') ?? 'anon',
})

// Health check - basic (for Railway)
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Detailed health check - checks all services
app.get('/health/detailed', async (c) => {
  const checks: Record<string, { status: string; error?: string; latency?: number }> = {}

  // Check PostgreSQL
  try {
    const start = Date.now()
    const { prisma } = await import('./lib/prisma.js')
    await prisma.$queryRaw`SELECT 1`
    checks.postgres = { status: 'ok', latency: Date.now() - start }
  } catch (err: any) {
    checks.postgres = { status: 'error', error: err.message }
  }

  // Check Qdrant
  try {
    const start = Date.now()
    const qdrantUrl = process.env.QDRANT_URL
    if (qdrantUrl) {
      const { qdrantClient } = await import('./lib/qdrant.js')
      await qdrantClient.getCollections()
      checks.qdrant = { status: 'ok', latency: Date.now() - start }
    } else {
      checks.qdrant = { status: 'skipped', error: 'QDRANT_URL not configured' }
    }
  } catch (err: any) {
    checks.qdrant = { status: 'error', error: err.message }
  }

  // Check Cloudinary
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    if (cloudName && apiKey && apiSecret) {
      checks.cloudinary = { status: 'ok' }
    } else {
      checks.cloudinary = { status: 'error', error: 'Missing CLOUDINARY env vars' }
    }
  } catch (err: any) {
    checks.cloudinary = { status: 'error', error: err.message }
  }

  // Check Firebase
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    if (serviceAccount) {
      JSON.parse(serviceAccount) // Validate JSON
      checks.firebase = { status: 'ok' }
    } else {
      checks.firebase = { status: 'error', error: 'FIREBASE_SERVICE_ACCOUNT not set' }
    }
  } catch (err: any) {
    checks.firebase = { status: 'error', error: err.message }
  }

  // Check Groq
  checks.groq = process.env.GROQ_API_KEY
    ? { status: 'ok' }
    : { status: 'error', error: 'GROQ_API_KEY not set' }

  const allOk = Object.values(checks).every(c => c.status === 'ok' || c.status === 'skipped')

  return c.json({
    status: allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    checks
  }, allOk ? 200 : 503)
})

// Routes
app.use('/api/agent/*', agentRateLimit)
app.route('/api/agent', agentRoutes)
app.route('/api/profiles', profileRoutes)
app.route('/api/documents', documentRoutes)
app.route('/api/letters', letterRoutes)
app.route('/api/organizations', organizationRoutes)

// Static files
app.use('/public/*', serveStatic({ root: './' }))

// Dashboard SPA — serve static assets then fall back to index.html for client-side routing
app.use('/dashboard/*', serveStatic({ root: './', rewriteRequestPath: (path) => path.replace(/^\/dashboard/, '/public/dashboard') }))
app.get('/dashboard/*', serveStatic({ path: './public/dashboard/index.html' }))

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

const port = process.env.PORT || 3000

console.log(`Starting server on port ${port}...`)
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
console.log(`Database URL configured: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`)

export default {
  port,
  fetch: app.fetch,
  idleTimeout: 255,
}
