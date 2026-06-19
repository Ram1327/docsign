# DocSign Platform Architecture

This document provides a directory-by-directory breakdown of the **DocSign** monorepo structure, explaining the responsibilities of each subfolder in both the frontend (React) and backend (Express/Node.js).

---

## 📂 Backend Structure (`backend/src/`)

The backend follows a layered MVC-style architecture built with Node.js, Express, TypeScript, and MongoDB (via Mongoose).

```
backend/src/
├── config/         # System configurations
├── controllers/    # Route handler controllers
├── middleware/     # Custom Express middlewares
├── models/         # Database models (Mongoose)
├── routes/         # API route configurations
├── scripts/        # Database and system utilities
├── services/       # Core business logic layer
├── types/          # Backend TypeScript interfaces
└── utils/          # Pure utility helpers
```

### 📁 config
* **Purpose**: Manages system configurations, environment variable definitions, and database connections.
* **Key Contents**: Sets up MongoDB connection parameters and parses process environment variables safely (e.g., JWT secrets, ports).

### 📁 controllers
* **Purpose**: The entry point for incoming HTTP requests. Controllers parse parameters, call the appropriate services, and send HTTP responses.
* **Key Contents**: 
  * `auth.controller.ts`: Handles login, registration, and profile fetching.
  * `document.controller.ts`: Handles document uploads, metadata fetching, and file serving.
  * `signingLink.controller.ts`: Handles secure signing link generation, validation, and signing consumption.

### 📁 middleware
* **Purpose**: Code executed before requests hit controllers to handle security, validations, or utilities.
* **Key Contents**:
  * `auth.middleware.ts`: Verifies JWT tokens on protected routes.
  * `errorHandler.middleware.ts`: Formats and handles global errors.
  * `upload.middleware.ts`: Configures Multer for handling file uploads.

### 📁 models
* **Purpose**: Defines Mongoose Schemas representing MongoDB database collections.
* **Key Contents**: 
  * `User.model.ts`: Accounts, emails, and hashed passwords.
  * `Document.model.ts`: Title, files status, and owner.
  * `Signature.model.ts`: Coordinate fields, signing status, and timestamp.
  * `SigningLink.model.ts`: Tokens for anonymous guest signers.

### 📁 routes
* **Purpose**: Maps URL endpoints to their respective controllers and middlewares.
* **Key Contents**: Groups endpoints into logical routers: `/api/auth`, `/api/documents`, and `/api/signing-links`.

### 📁 scripts
* **Purpose**: Executable files for database seeds or administrative tasks.
* **Key Contents**: Database seeder script (`seed.ts`) to populate a fresh database with demo accounts.

### 📁 services
* **Purpose**: The core business logic layer. Performs database queries, calculates coordinates, validates tokens, and processes PDF documents.
* **Key Contents**:
  * `signingLink.service.ts`: Houses logic to generate secure tokens and consume links.
  * `audit.service.ts`: Records system and action audit logs.

### 📁 types
* **Purpose**: System-wide TypeScript type declarations for Express requests, models, and payloads.

### 📁 utils
* **Purpose**: Independent helper functions without side effects.
* **Key Contents**: Password hashing tools, JWT generator helpers, and standard API response formats.

---

## 📂 Frontend Structure (`frontend/src/`)

The frontend is a single-page application (SPA) built using React, Vite, TailwindCSS (vanilla utilities), and TypeScript.

```
frontend/src/
├── components/     # UI components
│   ├── layout/     # Page layouts and shells
│   ├── signature/  # PDF signing canvas/modals
│   └── ui/         # Generic UI primitives
├── context/        # React global state providers
├── hooks/          # Custom React hooks
├── pages/          # Full page views
├── routes/         # Routing configurations
├── services/       # Axios API client modules
├── types/          # Frontend TypeScript declarations
└── utils/          # Client-side utility functions
```

### 📁 components
* **Purpose**: Modular, reusable UI components.
  * **`layout/`**: Structural components (e.g., the sidebar, top navbar, and main shell).
  * **`signature/`**: Features related to document signature placement, the PDF viewing canvas (`PDFViewer.tsx`), and the `GenerateLinkModal.tsx`.
  * **`ui/`**: Generic, low-level UI elements (e.g., `Button`, `Input`, `StatusBadge`).

### 📁 context
* **Purpose**: React Context providers for managing global states.
* **Key Contents**: `AuthContext.tsx` handles user authentication status, logins, and registers, sharing user states across all page components.

### 📁 hooks
* **Purpose**: Encapsulates reusable React logic.
* **Key Contents**: Custom hooks like `useSignatures` (coordinates/signature list fetching) and `usePDFBlob` (fetching PDFs securely via blob URLs).

### 📁 pages
* **Purpose**: High-level viewport components corresponding to routes.
* **Key Contents**: 
  * `LoginPage.tsx` / `RegisterPage.tsx`: Auth entry pages.
  * `DashboardPage.tsx`: Document table and action lists.
  * `DocumentDetailPage.tsx`: Main screen for placing signature fields.
  * `PublicSignPage.tsx`: The anonymous page where guests sign documents.

### 📁 routes
* **Purpose**: Controls navigation structure.
* **Key Contents**: Configures routes via React Router (`AppRouter.tsx`) and handles protected routes via `PrivateRoute.tsx`.

### 📁 services
* **Purpose**: Serves as the API client layer. Defines modules that make HTTP requests to the backend server.
* **Key Contents**: Uses customized Axios instances (`api.ts`) to request endpoints for auth, documents, and signing links.

### 📁 types
* **Purpose**: TypeScript interfaces reflecting both API payloads and local UI states.

### 📁 utils
* **Purpose**: Client-side helper operations.
* **Key Contents**: File size formatters, date localizers, and local storage managers (`storage.ts`) for token handling.
