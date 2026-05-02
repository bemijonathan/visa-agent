# Deployment Guide

## Overview

| Component | Platform | URL |
|-----------|----------|-----|
| Backend + Dashboard | Railway / Fly.io | `https://your-app.railway.app` |
| PostgreSQL | Railway / Supabase / Neon | Managed service |
| Extension | Chrome Web Store | Manual upload |

---

## Option 1: Railway (Recommended)

Railway is the easiest option - it auto-detects the Dockerfile and provides managed PostgreSQL.

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Create PostgreSQL Database
1. Click "New Project" → "Provision PostgreSQL"
2. Copy the `DATABASE_URL` from the Variables tab

### Step 3: Deploy Backend
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Set environment variables
railway variables set DATABASE_URL="your-postgres-url"
railway variables set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
railway variables set GOOGLE_AI_API_KEY="your-key"
railway variables set GROQ_API_KEY="your-key"
railway variables set CLOUDINARY_CLOUD_NAME="your-cloud"
railway variables set CLOUDINARY_API_KEY="your-key"
railway variables set CLOUDINARY_API_SECRET="your-secret"
railway variables set DASHBOARD_URL="https://your-app.railway.app"
railway variables set NODE_ENV="production"

# Deploy
railway up
```

### Step 4: Run Database Migration
```bash
railway run bunx prisma db push
```

---

## Option 2: Fly.io

### Step 1: Install Fly CLI
```bash
# macOS
brew install flyctl

# Or curl
curl -L https://fly.io/install.sh | sh
```

### Step 2: Login & Launch
```bash
flyctl auth login
flyctl launch
```

### Step 3: Create PostgreSQL
```bash
flyctl postgres create --name visa-agent-db
flyctl postgres attach visa-agent-db
```

### Step 4: Set Secrets
```bash
flyctl secrets set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
flyctl secrets set GOOGLE_AI_API_KEY="your-key"
flyctl secrets set GROQ_API_KEY="your-key"
flyctl secrets set CLOUDINARY_CLOUD_NAME="your-cloud"
flyctl secrets set CLOUDINARY_API_KEY="your-key"
flyctl secrets set CLOUDINARY_API_SECRET="your-secret"
flyctl secrets set DASHBOARD_URL="https://visa-agent.fly.dev"
```

### Step 5: Deploy
```bash
flyctl deploy
```

### Step 6: Run Migration
```bash
flyctl ssh console -C "bunx prisma db push"
```

---

## Dashboard Build

The dashboard is embedded in the backend. Before deploying:

```bash
cd dashboard
bun install
bun run build  # Outputs to ../backend/public/dashboard
```

The backend serves the dashboard at `/dashboard/*`.

---

## Chrome Extension

### Development Testing
1. Build: `cd extension && bun run build`
2. Go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" → select `extension/dist`

### Chrome Web Store Submission
1. Build production: `cd extension && bun run build`
2. Zip the `dist` folder
3. Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. Pay $5 one-time fee (if first time)
5. Click "New Item" → Upload zip
6. Fill in listing details:
   - Name: Visa Agent
   - Description: Auto-fill visa forms and generate letters
   - Screenshots (1280x800 or 640x400)
   - Icons (128x128)
7. Submit for review (takes 1-3 days)

### Extension Environment Variables
Update `extension/.env` before building:
```env
VITE_API_URL=https://your-app.railway.app
VITE_DASHBOARD_URL=https://your-app.railway.app/dashboard
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## Environment Variables Reference

### Backend (Production)
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `FIREBASE_SERVICE_ACCOUNT` | ✅ | Firebase service account JSON |
| `GOOGLE_AI_API_KEY` | ✅ | Gemini API for OCR/AI |
| `GROQ_API_KEY` | ✅ | Groq API for fast inference |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Document storage |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary secret |
| `DASHBOARD_URL` | ✅ | CORS origin (your deployed URL) |
| `CHROME_EXTENSION_ID` | ⚠️ | Extension ID after publishing |
| `PORT` | ❌ | Default: 3001 |
| `NODE_ENV` | ❌ | Set to `production` |

### Dashboard
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend URL |
| `VITE_FIREBASE_*` | ✅ | Firebase config |

### Extension
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend URL |
| `VITE_DASHBOARD_URL` | ✅ | Dashboard URL |
| `VITE_FIREBASE_*` | ✅ | Firebase config |
| `VITE_GOOGLE_CLIENT_ID` | ✅ | OAuth client ID |

---

## Firebase Setup (Production)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create project or use existing
3. Enable Authentication → Google Sign-in
4. Add your domains to authorized domains:
   - `your-app.railway.app`
   - `your-app.fly.dev`
5. Get service account:
   - Project Settings → Service Accounts → Generate New Private Key
   - Copy the JSON content to `FIREBASE_SERVICE_ACCOUNT` env var
6. Get web config:
   - Project Settings → General → Your Apps → Web
   - Copy config values to dashboard/extension .env files

---

## Deployment Checklist

- [ ] PostgreSQL database created
- [ ] `DATABASE_URL` set
- [ ] Firebase project configured
- [ ] `FIREBASE_SERVICE_ACCOUNT` set (backend)
- [ ] Firebase web config set (dashboard/extension)
- [ ] Google OAuth client ID created
- [ ] Cloudinary account created
- [ ] Groq API key created
- [ ] Dashboard built (`bun run build`)
- [ ] Backend deployed
- [ ] Database migrated (`prisma db push`)
- [ ] Extension built with production URLs
- [ ] Extension submitted to Chrome Web Store

---

## Monitoring & Logs

### Railway
```bash
railway logs
```

### Fly.io
```bash
flyctl logs
```

### Health Check
```bash
curl https://your-app.railway.app/health
```
