# Faculty Evaluation System - Task Tracking

**Project**: Faculty Evaluation and Performance Management System  
**Institution**: Central Asian University (CAU) - Department of Computer Science  
**Academic Year**: 2025-2026

---

## 📊 Progress Overview

- **Total Tasks**: (see phases below)
- **Completed (recent)**: Entry redirect, temp password & forced change, new submission (Research/Outreach only), layout fix, file upload, backend tests (auth + upload), admin "other submissions by user", Email & forgot password (EJS + Nodemailer)
- **In Progress**: None
- **Pending**: UI polish (header search, Register link, Scores export).
- **Blocked**: 0

---

## ✅ Current Implementation Status (as of 2025-01-29)

**Done:**

- **Entry & auth**
  - `/` redirects unauthenticated users to `/login`.
  - User model has `mustChangePassword`; login returns it; `PATCH /api/auth/password` for forced/voluntary change.
  - Frontend: login redirects to `/change-password` when `mustChangePassword`; change-password page; `ProtectedRoute` enforces change when flag is set.
- **New submission page** (`/dashboard/submissions/new`)
  - Only **Research** and **Outreach** (Teaching/Administrative are department-evaluated; callout + redirect for invalid category).
  - Points preview and action buttons layout fixed (stacked sidebar).
  - **File evidence**: file input, upload to `POST /api/upload`, `evidenceValue` = returned URL; validation blocks submit without file when type is “file”.
- **Backend**
  - `POST /api/upload` (auth, multer, 10MB limit), serves `uploads/` at `/uploads`.
  - **Jest tests (61 total)**: app.health; auth.routes; auth.service (login, changePassword, forgotPassword, resetPassword); email.service; faculty.routes; config.routes; admin.routes (submissions + POST scores/recalculate/:userId); admin.service (recalculateScore: category totals, ceilings, penalties, outcome, finalScore ≥ 0); upload.routes.

**Remaining (in order of suggested focus):**

1. ~~**Admin: other submissions by same user**~~ – Done: drawer section “Other submissions by [Name]”, fetch by userId, “View all” → `/admin/submissions?userId=xxx`, URL filter with clear.
2. ~~**User profile page & API**~~ – Done: `PATCH /api/auth/profile` (TDD + backend), `/dashboard/profile` page (edit firstName, lastName, department, facultyRank), Profile in sidebar, header User button → profile, Change password link.
3. ~~**Wire to real API**~~ – Done: Dashboard, Submissions list/detail/new, Scores, Penalties use facultyApi; drawer save and Edit page use updateSubmission; new submission uses createSubmission.
4. ~~**Email & forgot password**~~ – Done: EJS + Nodemailer; templates (welcome, reset, warning, alert, oauth); User passwordResetToken/passwordResetExpires; POST /auth/forgot-password, POST /auth/reset-password; welcome email on register; frontend Forgot password link, /forgot-password, /reset-password pages; Jest tests for forgot/reset.
5. ~~**UI polish**~~ – Done: Header search removed from Dashboard and Admin layouts; Register link on login (“Admin? Register new user” → /register).
6. **Academic year (dynamic)** – Admin can set current academic year via config key `app.current_academic_year` (value: YYYY-YYYY) in admin config; backend uses it when present, otherwise date-based (Sept–Aug). No separate “list of academic years” UI; add key in Config if needed.

---

## 🎯 Project Phases

### Phase 1: Project Setup & Configuration
**Status**: ⏳ Pending  
**Priority**: High  
**Estimated Time**: 2-3 days

### Phase 2: Database & Backend Development
**Status**: ⏳ Pending  
**Priority**: High  
**Estimated Time**: 5-7 days

### Phase 3: Frontend Development
**Status**: ⏳ Pending  
**Priority**: High  
**Estimated Time**: 7-10 days

### Phase 4: Scoring Engine & Business Logic
**Status**: ⏳ Pending  
**Priority**: High  
**Estimated Time**: 4-5 days

### Phase 5: Testing & Quality Assurance
**Status**: ⏳ Pending  
**Priority**: Medium  
**Estimated Time**: 3-4 days

### Phase 6: Deployment & Documentation
**Status**: ⏳ Pending  
**Priority**: Medium  
**Estimated Time**: 2-3 days

---

## 📋 Detailed Task List

### Phase 1: Project Setup & Configuration

#### 1.1 Project Initialization
- [ ] **Task**: Initialize Next.js 16 frontend project with TypeScript
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: None
  - **Estimated Time**: 1 hour
  - **Location**: `frontend/` folder

- [ ] **Task**: Initialize Express.js backend project with TypeScript
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: None
  - **Estimated Time**: 1 hour
  - **Location**: `backend/` folder

- [ ] **Task**: Configure Tailwind CSS with dark mode support
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: 1.1
  - **Estimated Time**: 1 hour

- [ ] **Task**: Set up shadcn/ui components
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 1.2
  - **Estimated Time**: 2 hours

- [ ] **Task**: Configure project structure (folders, paths)
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: 1.1
  - **Estimated Time**: 30 minutes

- [ ] **Task**: Set up ESLint, Prettier, and TypeScript config
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Low
  - **Dependencies**: 1.1
  - **Estimated Time**: 1 hour

#### 1.2 Environment & Dependencies
- [ ] **Task**: Create frontend .env.example and environment setup
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: None
  - **Estimated Time**: 30 minutes
  - **Location**: `frontend/.env.local`

- [ ] **Task**: Create backend .env.example and environment setup
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: None
  - **Estimated Time**: 30 minutes
  - **Location**: `backend/.env`

- [ ] **Task**: Install and configure MongoDB connection (Mongoose) in backend
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 1.1 (backend)
  - **Estimated Time**: 1 hour
  - **Location**: `backend/src/utils/db.ts`

- [ ] **Task**: Set up Express.js API routes structure
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 1.1 (backend)
  - **Estimated Time**: 1 hour
  - **Location**: `backend/src/routes/`

- [ ] **Task**: Configure authentication libraries (JWT, bcrypt) in backend
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 1.2 (backend)
  - **Estimated Time**: 1 hour
  - **Location**: `backend/src/middleware/auth.middleware.ts`

- [ ] **Task**: Set up API client in frontend for backend communication
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 1.1 (frontend), 1.2 (frontend)
  - **Estimated Time**: 1 hour
  - **Location**: `frontend/lib/api/`

---

### Phase 2: Database & Backend Development

#### 2.1 Database Models
- [ ] **Task**: Create User model (Faculty/Admin) in backend
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 1.2 (backend)
  - **Estimated Time**: 2 hours
  - **Location**: `backend/src/models/User.ts`

- [ ] **Task**: Create Submission model in backend
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 2.1
  - **Estimated Time**: 2 hours
  - **Location**: `backend/src/models/Submission.ts`

- [ ] **Task**: Create Configuration model in backend
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: 1.2 (backend)
  - **Estimated Time**: 1 hour
  - **Location**: `backend/src/models/Configuration.ts`

- [ ] **Task**: Create Penalty model in backend
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: 2.1
  - **Estimated Time**: 1 hour
  - **Location**: `backend/src/models/Penalty.ts`

- [ ] **Task**: Create Score model in backend
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 2.1, 2.2, 2.4
  - **Estimated Time**: 2 hours
  - **Location**: `backend/src/models/Score.ts`

#### 2.2 Authentication & Authorization
- [ ] **Task**: Implement JWT authentication middleware in backend
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 2.1
  - **Estimated Time**: 3 hours
  - **Location**: `backend/src/middleware/auth.middleware.ts`

- [ ] **Task**: Create login endpoint in backend
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: 2.2
  - **Estimated Time**: 1 hour
  - **Location**: `backend/src/routes/auth.routes.ts`

- [ ] **Task**: Create registration endpoint (Admin only) in backend
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Low
  - **Dependencies**: 2.2
  - **Estimated Time**: 1 hour
  - **Location**: `backend/src/routes/auth.routes.ts`

- [ ] **Task**: Implement role-based access control (RBAC) in backend
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 2.2
  - **Estimated Time**: 2 hours
  - **Location**: `backend/src/middleware/auth.middleware.ts`

- [ ] **Task**: Create authentication context/provider in frontend
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 1.2 (frontend)
  - **Estimated Time**: 2 hours
  - **Location**: `frontend/lib/auth/` or `frontend/contexts/`

#### 2.3 API Endpoints - Faculty
- [ ] **Task**: GET /api/faculty/dashboard
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 2.1, 2.5
  - **Estimated Time**: 2 hours

- [ ] **Task**: POST /api/faculty/submissions
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 2.1, 4.1
  - **Estimated Time**: 3 hours

- [ ] **Task**: GET /api/faculty/submissions
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: 2.1
  - **Estimated Time**: 1 hour

- [ ] **Task**: PUT /api/faculty/submissions/:id
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Low
  - **Dependencies**: 2.3
  - **Estimated Time**: 1 hour

- [ ] **Task**: GET /api/faculty/scores
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 2.5, 4.1
  - **Estimated Time**: 2 hours

- [ ] **Task**: GET /api/faculty/penalties
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Low
  - **Dependencies**: 2.4
  - **Estimated Time**: 1 hour

#### 2.4 API Endpoints - Admin
- [ ] **Task**: GET /api/admin/submissions
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 2.1, 2.2
  - **Estimated Time**: 2 hours

- [ ] **Task**: PUT /api/admin/submissions/:id/approve
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 2.4, 4.1
  - **Estimated Time**: 2 hours

- [ ] **Task**: PUT /api/admin/submissions/:id/reject
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: 2.4
  - **Estimated Time**: 1 hour

- [ ] **Task**: PUT /api/admin/submissions/:id/adjust
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Medium
  - **Dependencies**: 2.4, 4.1
  - **Estimated Time**: 2 hours

- [ ] **Task**: POST /api/admin/penalties
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 2.4, 4.1
  - **Estimated Time**: 2 hours

- [ ] **Task**: GET /api/admin/faculty
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Low
  - **Dependencies**: 2.1
  - **Estimated Time**: 1 hour

- [ ] **Task**: GET /api/admin/scores
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 2.5, 4.1
  - **Estimated Time**: 2 hours

- [ ] **Task**: GET /api/admin/reports
  - **Status**: ⏳ Pending
  - **Priority**: Low
  - **Complexity**: High
  - **Dependencies**: 2.5
  - **Estimated Time**: 4 hours

#### 2.5 Configuration Endpoints
- [ ] **Task**: GET /api/config
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Low
  - **Dependencies**: 2.1
  - **Estimated Time**: 1 hour

- [ ] **Task**: PUT /api/config/:key
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Low
  - **Dependencies**: 2.5
  - **Estimated Time**: 1 hour

- [ ] **Task**: GET /api/config/multipliers
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: 2.5
  - **Estimated Time**: 30 minutes

- [ ] **Task**: GET /api/config/ceilings
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: 2.5
  - **Estimated Time**: 30 minutes

---

### Phase 3: Frontend Development

#### 3.1 Layout & Navigation (Frontend)
- [ ] **Task**: Create root layout with theme provider
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 1.3 (frontend)
  - **Estimated Time**: 2 hours
  - **Location**: `frontend/app/layout.tsx`

- [ ] **Task**: Build sticky navbar component
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 3.1
  - **Estimated Time**: 2 hours
  - **Location**: `frontend/components/shared/Navbar.tsx`

- [ ] **Task**: Build collapsible sidebar component
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 3.1
  - **Estimated Time**: 3 hours
  - **Location**: `frontend/components/shared/Sidebar.tsx`

- [ ] **Task**: Create theme toggle component
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: 3.1
  - **Estimated Time**: 1 hour
  - **Location**: `frontend/components/shared/ThemeToggle.tsx`

- [ ] **Task**: Implement responsive mobile menu
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Medium
  - **Dependencies**: 3.2, 3.3
  - **Estimated Time**: 2 hours
  - **Location**: `frontend/components/shared/`

#### 3.2 Authentication Pages
- [ ] **Task**: Create login page
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 3.1, 2.2
  - **Estimated Time**: 2 hours

- [ ] **Task**: Create registration page (Admin only)
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Medium
  - **Dependencies**: 3.2
  - **Estimated Time**: 2 hours

- [ ] **Task**: Implement protected route wrapper
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 3.2
  - **Estimated Time**: 2 hours

#### 3.3 Faculty Dashboard
- [ ] **Task**: Create faculty dashboard layout
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: 3.1
  - **Estimated Time**: 1 hour

- [ ] **Task**: Build score tracker component
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 3.3, 2.3
  - **Estimated Time**: 3 hours

- [ ] **Task**: Create research submission form
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: High
  - **Dependencies**: 3.3, 2.3, 4.1
  - **Estimated Time**: 4 hours

- [ ] **Task**: Create teaching submission form
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: High
  - **Dependencies**: 3.3, 2.3, 4.1
  - **Estimated Time**: 4 hours

- [ ] **Task**: Create admin/service submission form
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: High
  - **Dependencies**: 3.3, 2.3, 4.1
  - **Estimated Time**: 4 hours

- [ ] **Task**: Create outreach submission form
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 3.3, 2.3, 4.1
  - **Estimated Time**: 3 hours

- [ ] **Task**: Build submission history component
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Medium
  - **Dependencies**: 3.3, 2.3
  - **Estimated Time**: 2 hours

- [ ] **Task**: Create penalty log component
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Low
  - **Dependencies**: 3.3, 2.3
  - **Estimated Time**: 1 hour

#### 3.4 Admin Panel
- [ ] **Task**: Create admin panel layout
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: 3.1
  - **Estimated Time**: 1 hour

- [ ] **Task**: Build configuration management page
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: High
  - **Dependencies**: 3.4, 2.5
  - **Estimated Time**: 5 hours

- [ ] **Task**: Create submission review queue
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: High
  - **Dependencies**: 3.4, 2.4
  - **Estimated Time**: 5 hours

- [ ] **Task**: Build penalty application form
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 3.4, 2.4
  - **Estimated Time**: 3 hours

- [ ] **Task**: Create faculty management page
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Medium
  - **Dependencies**: 3.4, 2.4
  - **Estimated Time**: 3 hours

- [ ] **Task**: Build reporting dashboard
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: High
  - **Dependencies**: 3.4, 2.4
  - **Estimated Time**: 6 hours

#### 3.5 Shared Components
- [ ] **Task**: Create reusable form components
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 1.3
  - **Estimated Time**: 3 hours

- [ ] **Task**: Build data table component
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Medium
  - **Dependencies**: 1.3
  - **Estimated Time**: 3 hours

- [ ] **Task**: Create file upload component
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Medium
  - **Dependencies**: 1.3
  - **Estimated Time**: 2 hours

- [ ] **Task**: Build notification/toast system
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Low
  - **Dependencies**: 1.3
  - **Estimated Time**: 1 hour

---

### Phase 4: Scoring Engine & Business Logic

#### 4.1 Score Calculation Engine (Backend)
- [ ] **Task**: Implement research score calculator
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: High
  - **Dependencies**: 2.1, 2.5
  - **Estimated Time**: 6 hours
  - **Location**: `backend/src/services/scoring.service.ts`

- [ ] **Task**: Implement teaching score calculator
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 2.1, 2.5
  - **Estimated Time**: 4 hours

- [ ] **Task**: Implement admin/service score calculator
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 2.1, 2.5
  - **Estimated Time**: 3 hours

- [ ] **Task**: Implement outreach score calculator
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: 2.1, 2.5
  - **Estimated Time**: 2 hours

- [ ] **Task**: Implement expectation multiplier logic
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 4.1
  - **Estimated Time**: 3 hours

- [ ] **Task**: Implement category ceiling enforcement
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: 4.1
  - **Estimated Time**: 2 hours

- [ ] **Task**: Implement penalty calculation
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 2.4
  - **Estimated Time**: 2 hours

- [ ] **Task**: Implement final score calculation
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 4.1, 4.6
  - **Estimated Time**: 2 hours

- [ ] **Task**: Implement outcome determination
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: 4.7
  - **Estimated Time**: 1 hour

#### 4.2 Validation & Business Rules
- [ ] **Task**: Implement submission validation
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 2.1
  - **Estimated Time**: 3 hours

- [ ] **Task**: Implement deadline validation
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Medium
  - **Dependencies**: 2.1
  - **Estimated Time**: 2 hours

- [ ] **Task**: Implement evidence validation
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Medium
  - **Dependencies**: 2.1
  - **Estimated Time**: 2 hours

---

### Phase 5: Testing & Quality Assurance

#### 5.1 Unit Testing
- [ ] **Task**: Write tests for score calculation functions
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 4.1
  - **Estimated Time**: 4 hours

- [ ] **Task**: Write tests for API endpoints
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 2.3, 2.4
  - **Estimated Time**: 5 hours

- [ ] **Task**: Write tests for authentication
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 2.2
  - **Estimated Time**: 3 hours

#### 5.2 Integration Testing
- [ ] **Task**: Test submission workflow end-to-end
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: High
  - **Dependencies**: 3.3, 2.3, 4.1
  - **Estimated Time**: 4 hours

- [ ] **Task**: Test admin approval workflow
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: High
  - **Dependencies**: 3.4, 2.4, 4.1
  - **Estimated Time**: 4 hours

- [ ] **Task**: Test score calculation accuracy
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: High
  - **Dependencies**: 4.1
  - **Estimated Time**: 4 hours

#### 5.3 UI/UX Testing
- [ ] **Task**: Test responsive design on multiple devices
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Low
  - **Dependencies**: 3.1
  - **Estimated Time**: 2 hours

- [ ] **Task**: Test dark mode functionality
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Low
  - **Dependencies**: 3.1
  - **Estimated Time**: 1 hour

- [ ] **Task**: Test form validation and error handling
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 3.3, 3.4
  - **Estimated Time**: 3 hours

---

### Phase 6: Deployment & Documentation

#### 6.1 Deployment Preparation
- [ ] **Task**: Set up production environment variables
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Low
  - **Dependencies**: None
  - **Estimated Time**: 1 hour

- [ ] **Task**: Configure production database
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 1.2
  - **Estimated Time**: 2 hours

- [ ] **Task**: Set up CI/CD pipeline
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: High
  - **Dependencies**: 5.1
  - **Estimated Time**: 4 hours

- [ ] **Task**: Deploy to production
  - **Status**: ⏳ Pending
  - **Priority**: High
  - **Complexity**: Medium
  - **Dependencies**: 6.1, 6.2
  - **Estimated Time**: 2 hours

#### 6.2 Documentation
- [ ] **Task**: Complete API documentation
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Medium
  - **Dependencies**: 2.3, 2.4, 2.5
  - **Estimated Time**: 3 hours

- [ ] **Task**: Create user guide for faculty
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Low
  - **Dependencies**: 3.3
  - **Estimated Time**: 2 hours

- [ ] **Task**: Create admin manual
  - **Status**: ⏳ Pending
  - **Priority**: Medium
  - **Complexity**: Low
  - **Dependencies**: 3.4
  - **Estimated Time**: 2 hours

---

## 🔄 Task Status Legend

- ⏳ **Pending** - Not started
- 🔄 **In Progress** - Currently working on
- ✅ **Completed** - Finished and tested
- 🚫 **Blocked** - Waiting on dependency or issue
- ⏸️ **On Hold** - Temporarily paused

## 📊 Priority Levels

- **High** - Critical for MVP, blocks other tasks
- **Medium** - Important but not blocking
- **Low** - Nice to have, can be deferred

## 🎯 Complexity Levels

- **Low** - Simple task, < 2 hours
- **Medium** - Moderate complexity, 2-4 hours
- **High** - Complex task, 4+ hours

---

## 📝 Notes

- Update this file as tasks are completed
- Mark dependencies clearly
- Update progress overview regularly
- Add blockers and issues as they arise

---

## 📋 Prompt for Next Chat (copy below)

Use this in a new chat to continue without context rot:

```
This is a Faculty Evaluation System (Next.js frontend, Express backend, MongoDB). Read @TASKS.md for current status.

**Done so far:** Entry redirect to /login; temporary password & forced change (backend + frontend); new submission page only Research/Outreach; layout fix; file upload (POST /api/upload + frontend file evidence); backend Jest tests for auth and upload.

**Next priorities (from TASKS.md):**
1. Admin: when viewing a professor's submission, add a way to see other submissions by that same user (drawer or page, good UX).
2. User profile page & API (profile update, link from sidebar/header).
3. Wire Dashboard, Submissions list/detail, Scores, Penalties to real API; implement Edit Submission.
4. Email service & Forgot password5. UI polish (header search or remove; register link if needed).

Work on the next unfinished item. Prefer tests first (TDD) where applicable, then implement and run tests until green.
```

---

**Last Updated**: 2025-01-29  
**Next Review**: Weekly

