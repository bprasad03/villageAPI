# VillageAPI 🇮🇳

> India's Complete Village Data API Platform

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![React](https://img.shields.io/badge/React-19.0+-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)

**Live Demo:** [https://village-api-indol.vercel.app/](https://village-api-indol.vercel.app/)

VillageAPI is a full-stack platform providing incredibly fast, highly reliable API endpoints to access India's vast hierarchical geographical data (States ➔ Districts ➔ Sub-districts ➔ Villages). Built with a modern serverless architecture, it comes with a developer portal for API key generation and an admin dashboard for user management.

---

## 🏗️ Architecture Overview

The project is structured as a Monorepo containing both the backend API and the frontend developer portal. It is designed to be highly scalable and deployed entirely on **Vercel's serverless infrastructure**.

```mermaid
graph LR
    A[Client App] -->|HTTP /v1/*| B(Vercel Edge Network)
    B -->|Static Assets| C[Frontend UI]
    B -->|API Routes| D[Express Serverless Functions]
    D -->|Prisma Connection Pool| E[(PostgreSQL Database)]
```

### 🔹 Components
1. **Frontend (UI & Developer Portal)**
   - Built with **React** and **Vite** for lightning-fast HMR and optimized static builds.
   - Served statically via Vercel's Edge CDN.
2. **Backend (Core API)**
   - Built with **Node.js** & **Express**.
   - Hosted as Vercel Serverless Functions (`api/index.js`).
3. **Database Layer**
   - **PostgreSQL** hosted externally (e.g., Neon/Supabase).
   - Interacted with via **Prisma ORM** using connection pooling to prevent serverless connection exhaustion.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **Routing:** React Router v7
- **Charts/Data Vis:** Recharts
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Security:** Helmet, CORS, Express Rate Limit, bcryptjs
- **Auth:** JSON Web Tokens (JWT), API Keys

---

## 🔄 Backend Flow & Features

### 1. Public Endpoints & Developer Portal
Users can sign up and log in via JWT authentication. Once logged in, they can access the Developer Portal to generate unique **API Keys**. 

### 2. Protected API Routes
When an external application calls the API (e.g., `/v1/autocomplete?q=Ram`), the request passes through the `requireApiKey` middleware.
- The middleware validates the API key.
- Tracks API usage and enforces daily rate limits.
- Logs the request endpoint, status code, and timestamp to the database.

### 3. Core Search Engine
The backend performs highly optimized queries using Prisma's `contains` and `startsWith` (case-insensitive) filters. Data is returned in a strictly typed JSON structure containing the full geographic hierarchy:
- `village`
- `subDistrict`
- `district`
- `state`

### 4. Admin Dashboard
A secure administrative panel that allows platform owners to:
- Approve or Suspend user accounts.
- Upgrade or downgrade user billing plans (Free/Pro).
- View global API request logs and platform statistics.

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bprasad03/villageAPI.git
   cd villageAPI
   ```

2. **Install Root Dependencies:**
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/db?sslmode=require&pgbouncer=true"
   PORT=3000
   NODE_ENV=development
   JWT_SECRET="your_jwt_secret_here"
   ADMIN_EMAIL="admin@villageapi.com"
   ADMIN_PASSWORD="admin123"
   ```

5. **Database Setup:**
   Generate the Prisma client and push the schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Running the App

To run both the frontend and backend simultaneously:

**Terminal 1 (Backend):**
```bash
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## ☁️ Deployment

This project is configured for one-click deployment on **Vercel**.

1. The `vercel.json` file handles all routing, redirecting `/v1/*` to the serverless Express backend and `/*` to the Vite frontend.
2. A `postinstall` script in `package.json` ensures the Prisma Client is generated during the Vercel build phase.
3. The Vite build is executed with `npm install --include=dev` to ensure required build tools are available in Vercel's production environment.

**Required Vercel Environment Variables:**
- `DATABASE_URL`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

*(Ensure your Vercel project Framework Preset is set to "Other").*
