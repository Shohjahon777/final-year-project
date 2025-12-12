# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB running (local or Atlas)

## Setup Steps

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 2. Configure Environment Variables

**Frontend** - Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Backend** - Create `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/faculty-evaluation
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas** (cloud) - update MONGODB_URI in backend/.env

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

### 5. Verify Installation

1. Open http://localhost:3000 - Should see the homepage
2. Open http://localhost:5000/api/health - Should return `{"status":"ok",...}`

## Project Structure

```
final-year-project/
├── frontend/          # Next.js 16 application
│   ├── app/           # App Router pages
│   ├── components/    # React components
│   └── lib/           # Utilities & API client
│
├── backend/           # Express.js API
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── models/    # Database models (to be created)
│   │   ├── services/  # Business logic (to be created)
│   │   └── middleware/# Auth & error handling
│
└── Documentation files (README.md, API.md, etc.)
```

## Next Steps

1. ✅ Phase 1 Complete - Project Setup
2. ⏳ Phase 2 - Database Models & Backend Development
3. ⏳ Phase 3 - Frontend Development
4. ⏳ Phase 4 - Scoring Engine

See `TASKS.md` for detailed task list.
