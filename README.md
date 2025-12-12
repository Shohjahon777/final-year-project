# Faculty Evaluation and Performance Management System

**Central Asian University (CAU) - Department of Computer Science**  
**Academic Year: 2025-2026**

A comprehensive web application for evaluating faculty performance using a transparent, fair, and measurable point-based system that supports salary increments, annual performance evaluation, promotion decisions, and contract renewal decisions.

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Purpose](#system-purpose)
- [Tech Stack](#tech-stack)
- [Evaluation Framework](#evaluation-framework)
- [Scoring System](#scoring-system)
- [Penalties](#penalties)
- [Final Evaluation Outcomes](#final-evaluation-outcomes)
- [User Roles](#user-roles)
- [Technical Architecture](#technical-architecture)
- [Database Schema](#database-schema)
- [API Structure](#api-structure)
- [UI/UX Design](#uiux-design)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)

---

## 🎯 Overview

The Faculty KPI & Performance Evaluation Framework provides a transparent, fair, measurable, and consistent method for evaluating academic staff. The system evaluates faculty across four major categories with a maximum of 100 points, incorporating category ceilings to prevent imbalance and ensuring accountability through a penalty system.

**Key Features:**
- Point-based evaluation across Research, Teaching, Administrative, and Outreach categories
- Dynamic configuration system for scoring rules and multipliers
- Role-based access control (Faculty and Admin)
- Real-time score calculation with expectation multipliers
- Penalty tracking and application
- Comprehensive reporting and HR action recommendations

---

## 🎓 System Purpose

This system directly supports:
- **Salary increments** - Performance-based compensation decisions
- **Annual performance evaluation** - Comprehensive yearly assessments
- **Promotion decisions** - Career advancement evaluations
- **Contract renewal decisions** - Retention and continuation assessments
- **Institutional quality** - Maintaining high standards in research output and student learning

---

## 🛠️ Tech Stack

### Frontend (`frontend/` folder)
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: React
- **UI Components**: shadcn/ui with custom styling
- **Styling**: Tailwind CSS with dark mode support
- **API Client**: Axios or Fetch API
- **State Management**: React Context / Zustand (as needed)

### Backend (`backend/` folder)
- **Framework**: Express.js
- **Runtime**: Node.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with bcrypt
- **CORS**: Enabled for frontend communication
- **Validation**: Express validators

### Shared
- **Database**: MongoDB (shared instance)
- **Authentication**: JWT tokens (shared secret)

---

## 📊 Evaluation Framework

The evaluation system consists of **4 major categories**, each with a maximum point allocation:

| Category | Max Points | Description |
|----------|-----------|-------------|
| **Research & Publications** | 40 | Papers, patents, books, research groups, funding |
| **Teaching & Learning** | 30 | Feedback, course prep, material upload, syllabus |
| **Administrative / Service** | 20 | Accreditation, committees, events, clubs |
| **Community & Outreach** | 10 | Representing CAU in public events |
| **Total** | **100** | With penalties applied afterward |

**Important**: Category ceilings prevent gaming the system. Even if someone produces 10 Q1 papers, the maximum research score is still 40 points.

---

## 🧮 Scoring System

### 1. Research & Publications (Max 40 Points)

#### 1.1 Journal Publications (Web of Science)

**Base Points (for 1st or last author):**
- Q1 Journal: **10 points**
- Q2 Journal: **8 points**
- Q3 Journal: **6 points**
- Q4 Journal: **4 points**

**Authorship Multipliers:**
- **1st or last author**: ×1.0 (full score)
- **Middle author**: ×0.7
- **Corresponding author** (any position): ×1.1 additional multiplier
- **Student co-author bonus**: If any student is included → ×1.1 on the final score

**Calculation Example:**
```
Assistant Professor publishes Q2 paper as 3rd author, corresponding, with student coauthor:
- Base: 8 (Q2)
- Middle author: 8 × 0.7 = 5.6
- Corresponding: 5.6 × 1.1 = 6.16
- Student bonus: 6.16 × 1.1 = 6.776
- Expectation multiplier (Average = ×1.4): 6.776 × 1.4 = 9.49 points
```

#### 1.2 Scopus / CAU-Approved Conferences

- **1st or last author**: 3 points
- **Middle author**: 2.1 points (3 × 0.7)
- **Corresponding author**: ×1.1 multiplier
- **Student involvement**: ×1.1 multiplier

#### 1.3 Books & Chapters

- **Book** (1st author/editor): 8 points
- **Book chapter** (1st author): 2 points

#### 1.4 Patents (Strict Rules)

- **Genuine verified patent**: 15 points
  - Must be primary inventor
  - Accepted registries: USPTO, WIPO, EPO, UKIPO
- **Fake or low-quality patents** (e.g., Indian "quick patent" schemes): 0 points + academic dishonesty penalty

#### 1.5 Research Group & Supervision

- **Initiating research group**: 3 points (one-time award)
- **Running group** (active for a semester): 5 points
- **Student produces publication as 1st author under group**: +3 points

#### 1.6 Research Funding

- **> $20,000** (as Principal Investigator - PI): 25 points
- **< $20,000** (as Principal Investigator - PI): 10 points
- **Co-PI**: PI score × 0.3

---

### 2. Teaching & Learning (Max 30 Points)

#### 2.1 Student Feedback

- **80%+ satisfaction**: +3 points
- **70-79% satisfaction**: +1 point
- **<60% satisfaction**: -2 penalty

#### 2.2 Course Preparation

- **Previously taught course**: +1 point
- **New course**: +2.5 points

#### 2.3 Teaching Materials (EduPlus)

- **Upload complete materials in CAU format**: +2 points per course

#### 2.4 Syllabus Creation

- **+1 point per module**
- **Missing checkpoints**: -0.5 points

#### 2.5 Failure Rate Penalty

- **If >40% of students fail the course**: -2 points

---

### 3. Administrative & Service (Max 20 Points)

#### 3.1 Major Tasks

- **Accreditation leadership**: 20 points
- **Program revision committee**: 20 points

#### 3.2 Medium Tasks

- **Running a club**: 5 points per semester
- **Initiating club**: 3 points
- **Event with 100+ students**: 4 points
- **Event 50-99 students**: 1.5 points
- *Note: Event score applies per event*

#### 3.3 Minor Tasks

- **Reviewing exam questions**: 3 points per semester
- **Committee member**: 3-5 points
- **Volunteering** (e.g., coding club sessions): 0.1 points per hour
  - *Requires posting reminder in telegram ≥5 hours before session*

---

### 4. Community & Outreach (Max 10 Points)

**If representing CAU:**
- **Event with approximately 100 participants**: 3 points
- **Smaller events**: 0.5-2 points

**Examples of Community Outreach:**
- School visits
- STEM fairs
- Public lectures
- Workshops
- University exhibitions

---

## ⚠️ Penalties

### 8.1 Meeting Attendance

- Faculty can miss **only 2 meetings with valid reason**
- **Each additional meeting missed**: -2 points
- **Important/mandatory meetings may not be skipped**

### 8.2 Deadline Violations

- **Deadline must be announced at least 7 days earlier**
- **Late by <24 hours**: -1 point
- **Late by 24-48 hours**: -2 points
- **Late by 48-72 hours**: -3 points
- **Late by >72 hours**: -10 points (major violation)

### 8.3 Academic Dishonesty

**Automatic -20 points** for severe violations, including:
- Plagiarism
- Data fabrication
- Fake patents
- Manipulated student evaluations
- Ghost/gift authorship
- Cheating in documentation/evidence

---

## 🎯 Expectation Multipliers by Faculty Rank

The system uses expectation multipliers to adjust scores based on faculty rank and performance expectations.

### Expectation Levels & Multipliers

| Expectation Level | Multiplier |
|-------------------|------------|
| Great | ×1.0 |
| Good | ×1.2 |
| Average | ×1.4 |
| Below Average | ×1.5 |

### Expectation Profile by Rank

| Rank | Research Expectation | Admin Expectation | Student Satisfaction |
|------|---------------------|-------------------|---------------------|
| **Head** | Average | Great | Great |
| **Professor** | Great | Great | Good |
| **Associate Professor** | Good | Good | Good |
| **Assistant Professor** | Average | Average | Great |
| **Lecturer** | Below Average | Average | Great |

**How It Works:**
- Every activity has a base score
- Each rank has different expectations
- The expectation multiplier is applied to the final calculated score
- Junior faculty get rewarded more because of higher multipliers

**Example:**
- Base score of Q1 paper = 10 points
- **Professor** (Great expectation → ×1.0) → stays 10 points
- **Associate Professor** (Good → ×1.2) → 12 points
- **Assistant Professor** (Average → ×1.4) → 14 points
- **Lecturer** (Below Average → ×1.5) → 15 points

---

## 📈 Final Evaluation Outcomes

Final scores determine HR actions:

| Score Range | Outcome | Description |
|-------------|---------|-------------|
| **80-100** | **Outstanding** | Strong promotion candidate |
| **60-79** | **Satisfactory** | Increment eligible |
| **50-59** | **Improvement Plan** | Development required |
| **Below 50** | **Contract Risk** | Contract may or may not be renewed |

---

## 👥 User Roles

### Faculty Members

**Capabilities:**
- Submit evidence for Research, Teaching, Admin, and Outreach activities
- View current score breakdown and progress
- Track submission status (Pending, Approved, Rejected)
- View penalties applied
- See projected outcome based on current score
- Edit submissions before admin review

**Dashboard Features:**
- Point submission forms for each category
- Score tracker with category breakdown
- Penalty log
- Submission history
- Evidence upload (links, files, documents)

### Administrators

**Capabilities:**
- Configure scoring rules and multipliers dynamically
- Review and approve/reject faculty submissions
- Apply penalties manually (meetings, deadlines, academic dishonesty)
- Adjust point values for submissions
- Manage faculty accounts and roles
- Generate reports and HR action recommendations
- View all faculty scores and outcomes

**Admin Panel Features:**
- Configuration management (scoring rules, multipliers, ceilings)
- Submission review queue
- Penalty application forms
- Faculty management
- Reporting dashboard
- Audit trail for all changes

---

## 🏗️ Technical Architecture

### System Flow

```
Faculty Submission → Frontend (Next.js) → Backend API (Express.js) → Validation → Score Calculation → Storage (MongoDB) → Admin Review → Approval/Rejection → Final Score → Outcome Determination
```

### Key Components

1. **Frontend (Next.js 16)** - `frontend/` folder
   - Faculty Dashboard
   - Admin Panel
   - Authentication & Authorization
   - Real-time score calculations
   - Dynamic forms with validation
   - API client for backend communication

2. **Backend (Express.js)** - `backend/` folder
   - RESTful API endpoints
   - Authentication middleware
   - Score calculation engine
   - Configuration management
   - File upload handling
   - Database models and connections

3. **Database (MongoDB)**
   - User management
   - Submission storage
   - Configuration settings
   - Penalty records
   - Score history

### Architecture Overview

The project uses a **separated frontend and backend architecture**:
- **Frontend**: Next.js 16 application in `frontend/` folder
- **Backend**: Express.js API server in `backend/` folder
- **Communication**: Frontend makes HTTP requests to backend API
- **Database**: Shared MongoDB instance accessed by backend

---

## 💾 Database Schema

### Users Collection

```typescript
{
  _id: ObjectId,
  email: string,
  password: string (hashed),
  role: 'faculty' | 'admin',
  facultyRank?: 'Head' | 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer',
  firstName: string,
  lastName: string,
  department: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Submissions Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  category: 'research' | 'teaching' | 'admin' | 'outreach',
  subcategory: string, // e.g., 'journal', 'conference', 'student_feedback'
  title: string,
  description: string,
  evidence: {
    type: 'link' | 'file' | 'text',
    value: string
  },
  calculatedPoints: number,
  status: 'pending' | 'approved' | 'rejected',
  adminNotes?: string,
  submittedAt: Date,
  reviewedAt?: Date,
  reviewedBy?: ObjectId
}
```

### Configurations Collection

```typescript
{
  _id: ObjectId,
  category: string,
  key: string, // e.g., 'q1_base_points', 'assistant_professor_multiplier'
  value: number | string,
  description: string,
  updatedAt: Date,
  updatedBy: ObjectId
}
```

### Penalties Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  type: 'meeting' | 'deadline' | 'academic_dishonesty',
  description: string,
  points: number, // negative value
  appliedBy: ObjectId,
  appliedAt: Date,
  evidence?: string
}
```

### Scores Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  academicYear: string, // '2025-2026'
  research: number,
  teaching: number,
  admin: number,
  outreach: number,
  totalPenalties: number,
  finalScore: number,
  outcome: 'outstanding' | 'satisfactory' | 'improvement_plan' | 'contract_risk',
  calculatedAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Structure

### Authentication Endpoints

- `POST /api/auth/login` - Faculty/Admin login
- `POST /api/auth/register` - Admin-only registration
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Faculty Endpoints

- `GET /api/faculty/dashboard` - Get faculty dashboard data
- `POST /api/faculty/submissions` - Create new submission
- `GET /api/faculty/submissions` - Get all faculty submissions
- `GET /api/faculty/submissions/:id` - Get submission details
- `PUT /api/faculty/submissions/:id` - Update submission (before review)
- `DELETE /api/faculty/submissions/:id` - Delete submission (before review)
- `GET /api/faculty/scores` - Get current score breakdown
- `GET /api/faculty/penalties` - Get applied penalties

### Admin Endpoints

- `GET /api/admin/submissions` - Get all submissions (with filters)
- `PUT /api/admin/submissions/:id/approve` - Approve submission
- `PUT /api/admin/submissions/:id/reject` - Reject submission
- `PUT /api/admin/submissions/:id/adjust` - Adjust points manually
- `POST /api/admin/penalties` - Apply penalty to faculty
- `GET /api/admin/faculty` - Get all faculty members
- `GET /api/admin/scores` - Get all faculty scores
- `GET /api/admin/reports` - Generate reports

### Configuration Endpoints

- `GET /api/config` - Get all configurations
- `PUT /api/config/:key` - Update configuration value
- `GET /api/config/multipliers` - Get expectation multipliers
- `GET /api/config/ceilings` - Get category ceilings

---

## 🎨 UI/UX Design

The application follows a professional design system with full dark mode support. See [`ui.md`](./ui.md) for complete styling guidelines.

### Color Palette

**Primary Colors:**
- Primary Blue: `#3182CE`
- Primary Dark: `#2C5282`
- Primary Light: `#BEE3F8`
- Secondary Purple: `#805AD5`

**Semantic Colors:**
- Success: `#38A169` (Green)
- Warning: `#ED8936` (Orange)
- Danger: `#F56565` (Red)
- Info: `#3182CE` (Blue)

### Component Standards

- **shadcn/ui components** with custom styling
- **Full dark mode support** using Tailwind `dark:` prefix
- **Smooth transitions** (duration-300) for theme switching
- **Responsive design** with mobile hamburger menu
- **Sticky navbar** (z-50) with proper shadows
- **Sidebar navigation** with hover/active states

### Layout Structure

- Sticky top navbar with logo, title, and theme toggle
- Collapsible left sidebar with navigation menu
- Main content area with proper spacing
- Card-based layouts with shadows and borders
- Form inputs with focus rings and proper dark mode styling

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MongoDB (local or Atlas)
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd final-year-project
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Set up environment variables:

**Frontend** (`frontend/.env.local`):
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your configuration
```

**Backend** (`backend/.env`):
```bash
cd ../backend
cp .env.example .env
# Edit .env with your configuration
```

5. Start MongoDB (if using local installation):
```bash
mongod
```

6. Start backend server:
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

7. Start frontend development server (in a new terminal):
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

8. Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

**Frontend** (`frontend/.env.local`):
```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Frontend URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Backend** (`backend/.env`):
```env
# Database
MONGODB_URI=mongodb://localhost:27017/faculty-evaluation
# or
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# CORS (Frontend URL)
FRONTEND_URL=http://localhost:3000

# File Upload (if using)
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png
```

---

## 📁 Project Structure

```
final-year-project/
├── frontend/               # Next.js 16 Frontend Application
│   ├── app/                # Next.js 16 App Router
│   │   ├── (auth)/         # Authentication routes
│   │   ├── (dashboard)/    # Protected routes
│   │   │   ├── faculty/    # Faculty dashboard
│   │   │   └── admin/      # Admin panel
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── faculty/        # Faculty-specific components
│   │   ├── admin/          # Admin-specific components
│   │   └── shared/         # Shared components
│   ├── lib/                # Frontend utilities
│   │   ├── api/            # API client for backend
│   │   ├── auth/           # Authentication utilities
│   │   └── utils.ts        # General utilities
│   ├── public/             # Static assets
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript types
│   ├── .env.local          # Frontend environment variables
│   ├── package.json
│   ├── tailwind.config.ts  # Tailwind configuration
│   └── tsconfig.json
│
├── backend/                # Express.js Backend API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── faculty.controller.ts
│   │   │   ├── admin.controller.ts
│   │   │   └── config.controller.ts
│   │   ├── routes/         # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── faculty.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── config.routes.ts
│   │   ├── services/       # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── scoring.service.ts
│   │   │   └── submission.service.ts
│   │   ├── models/         # Mongoose models
│   │   │   ├── User.ts
│   │   │   ├── Submission.ts
│   │   │   ├── Configuration.ts
│   │   │   ├── Penalty.ts
│   │   │   └── Score.ts
│   │   ├── middleware/     # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── utils/          # Backend utilities
│   │   │   ├── db.ts       # Database connection
│   │   │   └── logger.ts
│   │   └── app.ts          # Express app setup
│   ├── .env                # Backend environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
├── ui.md                   # UI styling guide
├── README.md               # This file
└── TASKS.md                # Task tracking
```

---

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## 📝 Development Guidelines

### Code Style

- **TypeScript strictly** - All code must be typed
- **No over-abstraction** - Keep services simple
- **Comments only for complex logic** - Code should be self-explanatory
- **Use existing libraries** - shadcn for UI, Mongoose for DB, bcrypt for passwords

### Commit Strategy

- **Incremental commits** - Commit after each prompt completion
- Use descriptive commit messages
- Follow conventional commit format when possible

### Best Practices

- **Modular code structure** - Reusable components and services
- **Environment variables** - Never commit secrets
- **RESTful API design** - Follow REST principles
- **Error handling** - Robust error handling and logging
- **Security** - Protect against XSS, CSRF, SQL injection
- **Performance** - Optimize queries, use caching where appropriate

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📄 License

This project is proprietary software for Central Asian University.

---

## 🙏 Acknowledgments

- Central Asian University (CAU) - Department of Computer Science
- Academic Year 2025-2026 Evaluation Framework

---

## 📞 Support

For questions or issues, please contact the development team or refer to the project documentation.

---

**Last Updated**: 2025  
**Version**: 1.0.0
