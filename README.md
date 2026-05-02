# Visa Agent

An AI-powered visa application assistant delivered as a Chrome extension + web dashboard. It helps users manage profiles, process documents, auto-fill visa forms, and generate support letters — all powered by Google Gemini AI.

## Features

- **Profile management** — store personal, passport, employment, and travel info for yourself and family members
- **Document processing** — upload passports, bank statements, and booking confirmations; text is extracted via OCR and used to answer form fields
- **Form auto-fill** — detect and fill visa application form fields on any webpage with one click
- **Letter generation** — generate custom cover letters, invitation letters, and employer support letters with free-text instructions; download as PDF
- **Dashboard** — manage profiles and documents from a web UI

## Architecture

```
visa-agent/
├── backend/    # Hono API server (Bun runtime)
├── dashboard/  # React web app (profile + document management)
├── extension/  # Chrome Extension MV3 (sidepanel, content script)
└── dev.sh      # One-command dev startup script
```

**Backend:** Hono · Prisma + PostgreSQL · Google Gemini 2.5 Pro · Cloudinary · Clerk · pdfkit

**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · Clerk

## Prerequisites

- [Bun](https://bun.sh) (runtime + package manager — replaces Node/npm)
- [Docker Desktop](https://docker.com) (for PostgreSQL)
- API keys: [Clerk](https://clerk.com), [Google AI](https://aistudio.google.com), [Cloudinary](https://cloudinary.com)

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
| `CLERK_SECRET_KEY` | Clerk backend secret key |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |
| `GOOGLE_AI_API_KEY` | Google AI (Gemini) API key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `DASHBOARD_URL` | Dashboard origin for CORS (default: `http://localhost:5173`) |
| `CHROME_EXTENSION_ID` | Your extension ID from `chrome://extensions` (leave blank in dev) |

**`extension/.env`**

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (default: `http://localhost:3001`) |
| `VITE_DASHBOARD_URL` | Dashboard URL (default: `http://localhost:5173`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (leave blank for dev bypass) |

**`dashboard/.env`**

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (default: `http://localhost:3001`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |

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
| `POST` | `/api/agent/chat` | Streaming chat via SSE |
| `POST` | `/api/agent/fill-form` | Fill form fields using profile + documents |
| `POST` | `/api/agent/generate-letter` | Generate a visa letter |
| `GET/POST` | `/api/profiles` | Profile CRUD |
| `GET/POST` | `/api/documents` | Document upload and management |
| `GET` | `/api/letters/:id/pdf` | Download a generated letter as PDF |
| `POST` | `/api/webhooks` | Clerk webhook handler (user sync) |

## Dev Mode (no Clerk)

When `VITE_CLERK_PUBLISHABLE_KEY` is not set (or is a placeholder) in `extension/.env`, the extension runs in **dev mode**: it skips authentication and sends a `dev-token` to the backend. The backend accepts this token when `NODE_ENV !== production` and `CLERK_SECRET_KEY` is not configured.

This lets you develop the full extension flow without setting up Clerk.

## Deployment Notes

- Set `NODE_ENV=production` in backend to enforce real Clerk auth (dev-token bypass is disabled)
- Set `DASHBOARD_URL` and `CHROME_EXTENSION_ID` in backend for strict CORS
- The extension must be rebuilt and reloaded after any source change in production
