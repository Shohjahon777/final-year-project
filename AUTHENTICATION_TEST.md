# Authentication UI Testing Guide

## ✅ What Has Been Created

### Frontend Components
1. **Authentication Context** (`frontend/lib/auth/auth-context.tsx`)
   - Global auth state management
   - Login, register, logout functions
   - Token and user persistence

2. **Login Page** (`frontend/app/(auth)/login/page.tsx`)
   - Email and password form
   - Error handling
   - Redirects to dashboard on success

3. **Register Page** (`frontend/app/(auth)/register/page.tsx`)
   - Admin-only access
   - Full user registration form
   - Faculty rank selection
   - Role selection (faculty/admin)

4. **Protected Route Component** (`frontend/components/auth/ProtectedRoute.tsx`)
   - Route protection
   - Admin-only route support
   - Loading states

5. **Dashboard Page** (`frontend/app/dashboard/page.tsx`)
   - User information display
   - Quick actions
   - Logout functionality

6. **UI Components**
   - Button component (custom styled)
   - Input component
   - Card component

## 🧪 Testing Steps

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

The backend should start on `http://localhost:5000`

### 2. Seed Default Configurations (First Time Only)

```bash
cd backend
npm run seed:config
```

### 3. Create First Admin User (Manual)

Since registration requires admin access, you need to create the first admin user manually. You can do this by:

**Option A: Using MongoDB directly**
```javascript
// In mongosh or MongoDB Compass
use faculty-evaluation
db.users.insertOne({
  email: "admin@cau.edu",
  password: "$2b$10$hashedpassword", // Use bcrypt to hash "admin123"
  role: "admin",
  firstName: "Admin",
  lastName: "User",
  department: "Computer Science",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Option B: Create a script** (I can create this for you)

### 4. Start Frontend Server

```bash
cd frontend
npm run dev
```

The frontend should start on `http://localhost:3000`

### 5. Test Authentication Flow

#### Test 1: Login
1. Navigate to `http://localhost:3000`
2. Click "Login" button
3. Enter admin credentials:
   - Email: `admin@cau.edu`
   - Password: `admin123` (or whatever you set)
4. Should redirect to `/dashboard`

#### Test 2: Dashboard Access
1. After login, should see dashboard with:
   - Welcome message with your name
   - User information card
   - Quick actions
   - Logout button

#### Test 3: Register New User (Admin Only)
1. While logged in as admin, navigate to `/register`
2. Fill in the registration form:
   - First Name: Test
   - Last Name: Faculty
   - Email: `faculty@cau.edu`
   - Password: `password123`
   - Confirm Password: `password123`
   - Role: Faculty
   - Faculty Rank: Assistant Professor
   - Department: Computer Science
3. Click "Register User"
4. Should redirect to dashboard

#### Test 4: Logout
1. Click "Logout" button on dashboard
2. Should redirect to home page
3. Try accessing `/dashboard` - should redirect to `/login`

#### Test 5: Protected Routes
1. While logged out, try accessing `/dashboard`
2. Should automatically redirect to `/login`
3. After login, should access dashboard successfully

#### Test 6: Admin-Only Routes
1. Login as faculty user
2. Try accessing `/register`
3. Should show "Access Denied" message

## 🔍 Troubleshooting

### Issue: "Cannot connect to backend"
- **Check**: Is backend running on port 5000?
- **Check**: Is `NEXT_PUBLIC_API_URL` set correctly in `.env.local`?

### Issue: "401 Unauthorized"
- **Check**: Is the JWT_SECRET set in backend `.env`?
- **Check**: Are you using the correct email/password?

### Issue: "CORS Error"
- **Check**: Is `FRONTEND_URL` set correctly in backend `.env`?
- **Check**: Backend CORS middleware should allow `http://localhost:3000`

### Issue: "Module not found" errors
- **Solution**: Run `npm install` in frontend directory
- **Check**: Are all shadcn components installed?

## 📝 Notes

- Tokens are stored in localStorage
- User data is persisted across page refreshes
- Protected routes automatically redirect unauthenticated users
- Admin-only routes check user role before rendering

## ✅ Expected Results

After successful testing, you should be able to:
- ✅ Login with valid credentials
- ✅ See user information on dashboard
- ✅ Register new users (as admin)
- ✅ Logout and be redirected
- ✅ Access protected routes only when authenticated
- ✅ See access denied for admin-only routes when not admin
