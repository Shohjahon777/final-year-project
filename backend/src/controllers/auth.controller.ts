import { Request, Response, NextFunction } from 'express'
import { login, register, getUserById, changePassword, updateProfile, forgotPassword, resetPassword } from '../services/auth.service'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'

export const forgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required' })
    }
    await forgotPassword(email.trim())
    res.status(200).json({ message: 'If an account exists with this email, you will receive a password reset link.' })
  } catch (error) {
    next(error)
  }
}

export const resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' })
    }
    await resetPassword(token, newPassword)
    res.status(200).json({ message: 'Password has been reset. You can now sign in.' })
  } catch (error) {
    next(error)
  }
}

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const result = await login({ email, password })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, role, facultyRank, department } = req.body

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Only admins can register new users
    const authReq = req as AuthRequest
    if (authReq.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can register new users' })
    }

    const result = await register({
      email,
      password,
      firstName,
      lastName,
      role,
      facultyRank,
      department,
    })

    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

export const getMeController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    const user = await getUserById(req.user.id)
    res.json({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      facultyRank: user.facultyRank,
      department: user.department,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword ?? false,
    })
  } catch (error) {
    next(error)
  }
}

export const changePasswordController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' })
    }
    const { currentPassword, newPassword } = req.body
    await changePassword(req.user.id, { currentPassword, newPassword })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

export const updateProfileController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' })
    }
    const { firstName, lastName, department, facultyRank } = req.body
    const data: { firstName?: string; lastName?: string; department?: string; facultyRank?: string } = {}
    if (firstName !== undefined) data.firstName = firstName
    if (lastName !== undefined) data.lastName = lastName
    if (department !== undefined) data.department = department
    if (facultyRank !== undefined) data.facultyRank = facultyRank
    const user = await updateProfile(req.user.id, data)
    res.json(user)
  } catch (error) {
    next(error)
  }
}
