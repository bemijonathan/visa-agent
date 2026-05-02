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

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
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
