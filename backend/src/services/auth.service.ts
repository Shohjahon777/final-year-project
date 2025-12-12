import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { AppError } from '../middleware/error.middleware'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

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
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
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

  // Create user
  const user = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    firstName,
    lastName,
    role,
    facultyRank: role === 'faculty' ? facultyRank : undefined,
    department: department || 'Computer Science',
  })

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
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
  }

  return { user: userData, token }
}

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select('-password')
  if (!user) {
    throw new AppError('User not found', 404)
  }
  return user
}
