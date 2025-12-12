# Setup Guide

**Faculty Evaluation System - Development Environment Setup**

This guide will help you set up the development environment for the Faculty Evaluation and Performance Management System.

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **npm/yarn/pnpm**: Package manager (npm comes with Node.js)
- **MongoDB**: Version 6.0 or higher (local installation or MongoDB Atlas account)
- **Git**: For version control
- **Code Editor**: VS Code, Cursor, or your preferred editor

### Verify Installation

```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be 9.0.0 or higher
mongod --version  # Should be 6.0.0 or higher (if installed locally)
git --version
```

---

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd final-year-project
```

---

## Step 2: Install Dependencies

The project has separate frontend and backend folders, each with their own `package.json`.

### Install Frontend Dependencies

```bash
cd frontend
npm install
# or
yarn install
# or
pnpm install
```

**Frontend dependencies include:**
- Next.js 16
- React and React DOM
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Axios or fetch for API calls

### Install Backend Dependencies

```bash
cd ../backend
npm install
# or
yarn install
# or
pnpm install
```

**Backend dependencies include:**
- Express.js
- TypeScript
- Mongoose
- JWT authentication
- bcrypt
- CORS
- dotenv

---

## Step 3: Environment Configuration

### Frontend Environment Variables

Create frontend environment file:

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Frontend URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend Environment Variables

Create backend environment file:

```bash
cd ../backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/faculty-evaluation
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS - Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload Configuration (if implementing file uploads)
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png
```

### Important Security Notes

- **Never commit `.env` file** to version control
- Use strong, random strings for `JWT_SECRET` in production
- Keep production credentials secure

---

## Step 4: MongoDB Setup

### Option A: Local MongoDB Installation

1. **Install MongoDB** (if not already installed):
   - Windows: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - macOS: `brew install mongodb-community`
   - Linux: Follow [MongoDB Installation Guide](https://www.mongodb.com/docs/manual/installation/)

2. **Start MongoDB Service**:
   ```bash
   # Windows (as Administrator)
   net start MongoDB
   
   # macOS/Linux
   mongod --dbpath /path/to/data/db
   ```

3. **Verify Connection**:
   ```bash
   mongosh
   # Should connect successfully
   ```

### Option B: MongoDB Atlas (Cloud)

1. **Create Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create Cluster**: Follow the setup wizard

3. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

4. **Update `.env`**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/faculty-evaluation?retryWrites=true&w=majority
   ```

### Initialize Database (Optional)

If you want to seed the database with initial data:

```bash
npm run db:seed
```

This will create:
- Default admin user
- Initial configuration values
- Sample data (if applicable)

---

## Step 5: Configure Tailwind CSS

The project uses Tailwind CSS with custom configuration. Verify `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EBF8FF',
          100: '#BEE3F8',
          500: '#3182CE',
          600: '#2C5282',
          900: '#1E3A8A',
        },
        // ... other colors from ui.md
      },
    },
  },
  plugins: [],
} satisfies Config
```

---

## Step 6: Set Up shadcn/ui

The project uses shadcn/ui components. Initialize if needed:

```bash
npx shadcn-ui@latest init
```

Follow the prompts:
- Would you like to use TypeScript? **Yes**
- Which style would you like to use? **Default**
- Which color would you like to use as base color? **Slate**
- Where is your global CSS file? **app/globals.css**
- Would you like to use CSS variables for colors? **Yes**

### Install Required Components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add dropdown-menu
```

---

## Step 7: Verify Project Structure

Ensure your project structure matches:

```
final-year-project/
├── frontend/               # Next.js 16 Frontend
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── faculty/
│   │   ├── admin/
│   │   └── shared/
│   ├── lib/
│   │   ├── api/            # API client
│   │   └── utils.ts
│   ├── public/
│   ├── styles/
│   ├── types/
│   ├── .env.local
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                # Express.js Backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── app.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## Step 8: Run Development Servers

### Start Backend Server

In the `backend` folder:

```bash
cd backend
npm run dev
```

The backend API should start at [http://localhost:5000](http://localhost:5000)

### Start Frontend Server

In a **new terminal**, navigate to the `frontend` folder:

```bash
cd frontend
npm run dev
```

The frontend application should start at [http://localhost:3000](http://localhost:3000)

### Verify Installation

1. **Backend**: Check [http://localhost:5000/api/health](http://localhost:5000/api/health) (if health endpoint exists)
2. **Frontend**: Open [http://localhost:3000](http://localhost:3000)
3. You should see the application (or login page if authentication is implemented)
4. Check browser console for any errors
5. Verify API calls are being made to the backend

---

## Step 9: Database Connection Test

Create a test script to verify database connection:

```typescript
// scripts/test-db.ts
import mongoose from 'mongoose';

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Database connected successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
```

Run the test:

```bash
npm run test:db
# Or
ts-node scripts/test-db.ts
```

---

## Step 10: Create Initial Admin User

If authentication is set up, create an initial admin user:

```bash
npm run create-admin
```

Or manually via MongoDB:

```javascript
// In mongosh or MongoDB Compass
use faculty-evaluation
db.users.insertOne({
  email: "admin@cau.edu",
  password: "$2b$10$hashedpassword", // Use bcrypt to hash
  role: "admin",
  firstName: "Admin",
  lastName: "User",
  department: "Computer Science",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## Troubleshooting

### Issue: MongoDB Connection Failed

**Solutions**:
- Verify MongoDB is running: `mongosh` or check service status
- Check `MONGODB_URI` in `.env` file
- Ensure firewall allows MongoDB connections
- For Atlas: Check IP whitelist and credentials

### Issue: Port 3000 Already in Use

**Solutions**:
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use different port
PORT=3001 npm run dev
```

### Issue: Module Not Found Errors

**Solutions**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript Errors

**Solutions**:
- Verify `tsconfig.json` is properly configured
- Check that all types are imported correctly
- Run `npm run type-check` to see detailed errors

### Issue: Tailwind Styles Not Applying

**Solutions**:
- Verify `tailwind.config.ts` content paths are correct
- Check `app/globals.css` includes Tailwind directives
- Restart development server

---

## Development Scripts

### Frontend Scripts (`frontend/package.json`)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### Backend Scripts (`backend/package.json`)

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "lint": "eslint src",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:db": "ts-node scripts/test-db.ts",
    "db:seed": "ts-node scripts/seed.ts",
    "create-admin": "ts-node scripts/create-admin.ts"
  }
}
```

### Root Level Scripts (Optional)

You can add a root `package.json` to run both servers:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\"",
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

---

## Next Steps

After setup is complete:

1. ✅ Verify all dependencies are installed
2. ✅ Database connection is working
3. ✅ Development server runs without errors
4. ✅ Review [README.md](./README.md) for project overview
5. ✅ Check [TASKS.md](./TASKS.md) for development tasks
6. ✅ Review [SCORING_LOGIC.md](./SCORING_LOGIC.md) for business logic
7. ✅ Start development following the task list

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Last Updated**: 2025  
**Version**: 1.0.0

