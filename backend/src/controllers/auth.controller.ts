import { Request, Response, NextFunction } from 'express'
import { login, register, getUserById } from '../services/auth.service'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'

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
    })
  } catch (error) {
    next(error)
  }
}
