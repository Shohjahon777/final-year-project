import express from 'express'
import { loginController, registerController, getMeController, changePasswordController, updateProfileController, forgotPasswordController, resetPasswordController } from '../controllers/auth.controller'
import { authenticate, requireAdmin } from '../middleware/auth.middleware'
import { authLimiter, forgotPasswordLimiter } from '../middleware/rate-limit.middleware'
import {
  loginValidator,
  registerValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../validators/auth.validator'

const router = express.Router()

// Public routes with strict rate limiting
router.post('/login', authLimiter, loginValidator, loginController)
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidator, forgotPasswordController)
router.post('/reset-password', authLimiter, resetPasswordValidator, resetPasswordController)

// Protected routes
router.post('/register', authenticate, requireAdmin, registerValidator, registerController)
router.get('/me', authenticate, getMeController)
router.patch('/password', authenticate, changePasswordValidator, changePasswordController)
router.patch('/profile', authenticate, updateProfileController)

export default router
