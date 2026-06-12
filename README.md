# DocSign — Document Signature App

A production-quality full-stack document signing SaaS application built with React, Node.js, MongoDB, and PDF-Lib. Designed for portfolio and internship evaluation.

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://docsign.vercel.app *(update after deploy)* |
| Backend API | https://docsign-backend.onrender.com *(update after deploy)* |
| Demo login | `demo@docsign.app` / `Demo1234` |

---

## Tech Stack

**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · React Router v6 · React Hook Form · Zod · react-pdf · Axios

**Backend:** Node.js · Express · TypeScript · Mongoose · Multer · PDF-Lib · JWT · bcrypt · Zod

**Database:** MongoDB Atlas

**Deployment:** Vercel (frontend) · Render (backend) · MongoDB Atlas (database)

---

## Features

- **JWT Authentication** — Access tokens (15m) + refresh token rotation with family-based theft detection
- **PDF Upload** — Multer + MIME validation + magic byte verification (real PDF, not renamed file)
- **PDF Viewer** — react-pdf page renderer with click-to-place signature fields
- **Signature Placement** — Click anywhere on any PDF page to place a signature field; coordinates stored relative to page dimensions (resolution-independent)
- **PDF Finalization** — PDF-Lib embeds signature annotations + generates a certification page
- **Public Signing Links** — Tokenized, expiring, single-use links for external signers (no account required)
- **Audit Trail** — Every action logged with actor, IP address, and metadata; viewable as a timeline
- **Document Lifecycle** — Pending → Signed / Rejected with full history

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Client (Vercel)                                    │
│  React + Vite · Tailwind · react-pdf · Axios        │
│  AuthContext · React Router · React Hook Form       │
└─────────────────┬───────────────────────────────────┘
                  │ HTTPS REST
┌─────────────────▼───────────────────────────────────┐
│  API Gateway (Render)                               │
│  Express · Helmet · CORS · Rate Limiter             │
│  JWT auth middleware · Audit middleware             │
└──────┬──────────┬───────────┬────────────┬──────────┘
       │          │           │            │
   Auth      Documents   Signatures   Signing Links
   Service   Service     Service      Service
       │          │           │            │
       └──────────┴───────────┴────────────┘
                          │
┌─────────────────────────▼───────────────────────────┐
│  MongoDB Atlas                                      │
│  users · documents · signatures                     │
│  refresh_tokens · audit_logs · signing_links        │
└─────────────────────────────────────────────────────┘
```

---

## Project Structure

```
docsign/
├── backend/
│   └── src/
│       ├── config/         # DB connection, env validation (Zod)
│       ├── controllers/    # HTTP layer only — no business logic
│       ├── middleware/     # auth, audit, upload, rate limit, errors
│       ├── models/         # Mongoose schemas
│       ├── routes/         # Express routers
│       ├── services/       # All business logic
│       ├── types/          # Shared TypeScript interfaces
│       └── utils/          # JWT, tokens, response helpers
└── frontend/
    └── src/
        ├── components/     # ui/, layout/, document/, signature/
        ├── context/        # AuthContext (useReducer)
        ├── hooks/          # useDocuments, useSignatures, usePDFBlob
        ├── pages/          # One file per route
        ├── routes/         # PrivateRoute, AppRouter
        ├── services/       # Axios wrappers per domain
        ├── types/          # Shared TypeScript interfaces
        └── utils/          # format, storage (localStorage)
```

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone and install

```bash
git clone https://github.com/yourusername/docsign.git
cd docsign
npm install
```

### 2. Backend environment

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/docsign
JWT_ACCESS_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<run same command again — different value>
```

### 3. Frontend environment

```bash
cp frontend/.env.example frontend/.env
# VITE_API_URL is already set to http://localhost:5000/api
```

### 4. Seed demo data (optional)

```bash
cd backend && npm run seed
# Creates: demo@docsign.app / Demo1234
```

### 5. Start development servers

```bash
# From project root — starts both backend and frontend
npm run dev

# Backend:  http://localhost:5000
# Frontend: http://localhost:5173
```

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login → access + refresh tokens |
| POST | `/api/auth/refresh` | — | Rotate refresh token |
| POST | `/api/auth/logout` | ✓ | Revoke refresh token family |
| GET | `/api/auth/me` | ✓ | Get current user |

### Documents

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/documents/upload` | ✓ | Upload PDF (multipart) |
| GET | `/api/documents` | ✓ | List owned documents (paginated) |
| GET | `/api/documents/:id` | ✓ | Get document metadata |
| DELETE | `/api/documents/:id` | ✓ | Soft delete |
| GET | `/api/documents/:id/file` | ✓ | Serve original PDF |
| GET | `/api/documents/:id/signed-file` | ✓ | Serve signed PDF |

### Signatures

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/signatures` | ✓ | Create signature field |
| GET | `/api/signatures/document/:id` | ✓ | List fields for document |
| DELETE | `/api/signatures/:id` | ✓ | Remove field |
| POST | `/api/signatures/finalize/:docId` | ✓ | Embed + generate signed PDF |

### Signing Links

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/signing-links/generate` | ✓ | Generate tokenized link |
| GET | `/api/signing-links/validate/:token` | — | Validate token |
| POST | `/api/signing-links/sign/:token` | — | Sign or reject via token |
| GET | `/api/signing-links/document/:id` | ✓ | List links for document |

### Audit

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/audit/:docId` | ✓ | Get full audit trail |

---

## Deployment

### Backend → Render

1. Push to GitHub
2. New Web Service on render.com → connect repo
3. Root directory: `backend`
4. Build: `npm install && npm run build`
5. Start: `node dist/app.js`
6. Add environment variables (from `.env.example`)
7. Add a persistent disk at `/opt/render/project/src/uploads`

### Frontend → Vercel

1. Import repo on vercel.com
2. Framework: Vite
3. Root directory: `frontend`
4. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com/api`
5. Deploy

### After both are live

Update these values in Render dashboard:
- `CORS_ORIGIN` → your Vercel URL
- `FRONTEND_URL` → your Vercel URL

---

## Testing

Import `DocSign.postman_collection.json` into Postman for all 20 endpoints with pre-configured variables and auto-save scripts.

Manual test flow:
1. Register / Login → token saved automatically by collection script
2. Upload PDF → docId saved automatically
3. Create signature field → sigId saved
4. Finalize → download signed PDF
5. Generate signing link → open URL in incognito
6. Sign or reject via public link
7. Check audit trail

---

## Security Highlights

- Refresh token rotation with family-based theft detection (RFC 6749)
- bcrypt password hashing (12 salt rounds)
- Magic byte PDF validation (prevents file disguise attacks)
- Rate limiting: 100 req/15min general, 5 req/15min on auth routes
- Helmet.js security headers
- Soft delete preserves audit trail referential integrity
- JWT tokens never stored server-side — refresh tokens use opaque UUIDs

---

## Key Engineering Decisions

**Why service layer?** Controllers only handle HTTP. Services hold business logic. Makes code testable in isolation and matches patterns at companies like Stripe.

**Why page-relative coordinates?** Signature position stored as `x/pageWidth` ratio — stays correct regardless of zoom level or screen size.

**Why opaque refresh tokens?** JWTs can't be revoked server-side. UUID-based tokens stored in DB enable logout and theft detection.

**Why soft delete?** Audit logs reference document IDs. Hard delete would orphan the entire audit history.

**Why audit middleware wraps `res.json()`?** Decouples logging from business logic completely. No controller needs to know about auditing.

---

## Author

**Ramsurya** — Built as an internship portfolio project demonstrating full-stack SaaS engineering.

[GitHub](https://github.com/yourusername) · [LinkedIn](https://linkedin.com/in/yourprofile)
