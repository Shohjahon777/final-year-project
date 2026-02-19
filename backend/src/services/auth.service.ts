import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { AppError } from '../middleware/error.middleware'
import { getJwtSecret } from '../utils/authEnv'
import * as emailService from './email.service'

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
const RESET_EXPIRY_MS = 60 * 60 * 1000 // 1 hour

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'faculty' | 'admin'
  facultyRank?: 'Head' | 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer'
  department?: string
}

export const login = async (credentials: LoginCredentials) => {
  const { email, password } = credentials

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) {
    throw new AppError('Invalid email or password', 401)
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Account is deactivated', 403)
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401)
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  )

  // Return user data (without password)
  const userData = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    facultyRank: user.facultyRank,
    department: user.department,
    mustChangePassword: user.mustChangePassword ?? false,
  }

  return { user: userData, token }
}

export const register = async (data: RegisterData) => {
  const { email, password, firstName, lastName, role, facultyRank, department } = data

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() })
  if (existingUser) {
    throw new AppError('User with this email already exists', 400)
  }

  // Hash password
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  // Create user (admin-created: temporary password, must change on first login)
  const user = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    firstName,
    lastName,
    role,
    facultyRank: role === 'faculty' ? facultyRank : undefined,
    department: department || 'Computer Science',
    mustChangePassword: true,
  })

  // Send welcome email (fire-and-forget; log errors)
  emailService.sendWelcome(user.email, {
    firstName: user.firstName,
    lastName: user.lastName,
    loginUrl: `${FRONTEND_URL}/login`,
  }).catch((err) => console.error('Welcome email failed:', err))

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  )

  // Return user data (without password)
  const userData = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    facultyRank: user.facultyRank,
    department: user.department,
    mustChangePassword: user.mustChangePassword ?? false,
  }

  return { user: userData, token }
}

export interface ChangePasswordData {
  currentPassword?: string
  newPassword: string
}

export const changePassword = async (userId: string, data: ChangePasswordData) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError('User not found', 404)
  }

  const { currentPassword, newPassword } = data

  if (!newPassword || newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400)
  }

  const isForcedChange = user.mustChangePassword

  if (isForcedChange) {
    // First-time forced change: no current password required
  } else {
    // Later change: require current password
    if (!currentPassword) {
      throw new AppError('Current password is required', 400)
    }
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      throw new AppError('Current password is incorrect', 401)
    }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  user.password = hashedPassword
  user.mustChangePassword = false
  await user.save()

  return { success: true }
}

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordResetToken +passwordResetExpires')
  if (!user) return

  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
  user.passwordResetToken = hashedToken
  user.passwordResetExpires = new Date(Date.now() + RESET_EXPIRY_MS)
  await user.save()

  const resetLink = `${FRONTEND_URL}/reset-password?token=${rawToken}`
  try {
    await emailService.sendResetPassword(user.email, { resetLink, expiresIn: '1 hour' })
  } catch (err) {
    console.error('Reset password email failed:', err)
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()
  }
}

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  if (!token || !newPassword || newPassword.length < 6) {
    throw new AppError('Valid token and new password (min 6 characters) are required', 400)
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires +password')
  if (!user) {
    throw new AppError('Invalid or expired reset token', 400)
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  user.password = hashedPassword
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  user.mustChangePassword = false
  await user.save()
}

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select('-password')
  if (!user) {
    throw new AppError('User not found', 404)
  }
  return user
}

const FACULTY_RANKS = ['Head', 'Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'] as const
export type FacultyRank = (typeof FACULTY_RANKS)[number]

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  department?: string
  facultyRank?: string
}

export const updateProfile = async (userId: string, data: UpdateProfileData) => {
  const user = await User.findById(userId).select('-password')
  if (!user) {
    throw new AppError('User not found', 404)
  }
  if (data.firstName !== undefined) user.firstName = data.firstName.trim()
  if (data.lastName !== undefined) user.lastName = data.lastName.trim()
  if (data.department !== undefined) user.department = data.department.trim()
  if (data.facultyRank !== undefined && user.role === 'faculty' && FACULTY_RANKS.includes(data.facultyRank as FacultyRank)) {
    user.facultyRank = data.facultyRank as FacultyRank
  }
  await user.save()
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    facultyRank: user.facultyRank,
    department: user.department,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword ?? false,
  }
}
