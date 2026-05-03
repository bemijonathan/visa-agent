# Visa Agent

An AI-powered visa application platform for immigration consultants and visa specialists. Manage client profiles, process documents, auto-fill visa forms, and generate support letters — all powered by Google Gemini AI.

## Who It's For

**Immigration consultants, visa agencies, and travel specialists** who process multiple visa applications. Visa Agent streamlines your workflow:

- Store client profiles with passport details, employment info, and travel history
- Upload and extract data from passports, bank statements, and bookings
- Fill any visa portal form (VFS, TLS, embassy sites) with one click
- Generate professional cover letters and support documents

## Features

- **Multi-tenant organizations** — create workspaces for your team, invite members, and share client profiles
- **Profile management** — store personal, passport, employment, and travel info for each client
- **Document processing** — upload passports, bank statements, and booking confirmations; text is extracted via OCR
- **Form auto-fill** — Chrome extension detects and fills visa application forms on any webpage
- **Letter generation** — generate custom cover letters, invitation letters, and employer support letters; download as PDF
- **Privacy-first** — no data retention beyond what you store, encrypted in transit, never sold

## Architecture

```
visa-agent/
├── backend/    # Hono API server (Node.js + tsx)
├── dashboard/  # React web app (profile + document management)
├── extension/  # Chrome Extension MV3 (sidepanel, content script)
└── dev.sh      # One-command dev startup script
```

**Backend:** Hono · Prisma + PostgreSQL · Google Gemini 2.5 Pro · Cloudinary · Firebase Admin · pdfkit

**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · Firebase Auth

## Prerequisites

- [Bun](https://bun.sh) (package manager for local dev)
- [Docker Desktop](https://docker.com) (for PostgreSQL)
- API keys: [Firebase](https://console.firebase.google.com), [Google AI](https://aistudio.google.com), [Cloudinary](https://cloudinary.com)

## Quick Start

### 1. Copy environment files

```bash
cp backend/.env.example backend/.env
cp extension/.env.example extension/.env
cp dashboard/.env.example dashboard/.env
```

### 2. Fill in environment variables

**`backend/.env`**

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Admin SDK service account JSON (stringified) |
| `GOOGLE_AI_API_KEY` | Google AI (Gemini) API key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `DASHBOARD_URL` | Dashboard origin for CORS (default: `http://localhost:5173`) |
| `CHROME_EXTENSION_ID` | Your extension ID from `chrome://extensions` |

**`extension/.env`**

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (default: `http://localhost:3001`) |
| `VITE_DASHBOARD_URL` | Dashboard URL (default: `http://localhost:5173`) |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |

**`dashboard/.env`**

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (default: `http://localhost:3001`) |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |

### 3. Start everything

```bash
./dev.sh
```

This single script will:
- Start PostgreSQL via Docker
- Install dependencies (first run only)
- Push the Prisma schema to the database
- Start the backend with hot reload (port 3001)
- Start the dashboard with hot reload (port 5173)
- Start the extension in Vite watch mode (rebuilds on save)

Press `Ctrl+C` to stop all services.

### 4. Load the extension in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/dist` directory

The extension rebuilds automatically when you edit source files. After a rebuild, click the refresh icon in `chrome://extensions` to reload it.

## Development

### Running services individually

```bash
# Backend
cd backend && bun run dev

# Dashboard
cd dashboard && bun run dev

# Extension (watch mode)
cd extension && bun run dev
```

### Backend scripts

```bash
bun run dev          # Hot reload dev server
bun run build        # Compile for production
bun run start        # Run production build
bun run db:push      # Push schema changes to DB (no migration file)
bun run db:migrate   # Create a named migration
bun run db:studio    # Open Prisma Studio (DB GUI)
```

### Extension scripts

```bash
bun run dev    # Vite watch mode
bun run build  # Production build
```

### Dashboard scripts

```bash
bun run dev    # Vite dev server with HMR
bun run build  # Production build
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/organizations` | List user's organizations |
| `POST` | `/api/organizations` | Create organization |
| `POST` | `/api/organizations/:id/invite` | Invite member by email |
| `GET/POST` | `/api/profiles` | Profile CRUD (org-scoped) |
| `GET/POST` | `/api/documents` | Document upload and management (org-scoped) |
| `POST` | `/api/agent/chat` | Streaming chat via SSE |
| `POST` | `/api/agent/fill-form` | Fill form fields using profile + documents |
| `POST` | `/api/agent/generate-letter` | Generate a visa letter |
| `GET` | `/api/letters/:id/pdf` | Download a generated letter as PDF |

All org-scoped endpoints require the `X-Organization-ID` header.

## Deployment

### Railway (Backend + Dashboard)

The project includes Railway configuration for monorepo deployment:

1. Create a new Railway project
2. Connect your GitHub repository
3. Add a PostgreSQL database service
4. Set environment variables in Railway dashboard
5. Deploy

The backend runs on Node.js + tsx (not Bun) in production for Prisma compatibility.

### Chrome Web Store (Extension)

1. Build the extension: `cd extension && bun run build`
2. Zip the `dist` folder
3. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. Fill in store listing details and submit for review

## Privacy

- All data encrypted in transit (HTTPS/TLS)
- No data retention beyond what you explicitly store
- Your data is never sold or shared with third parties
- Documents stored securely on Cloudinary with access controls
- See `/privacy-policy.html` for full privacy policy
