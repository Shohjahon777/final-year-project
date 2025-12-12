import express from 'express'
import { loginController, registerController, getMeController } from '../controllers/auth.controller'
import { authenticate, requireAdmin } from '../middleware/auth.middleware'

const router = express.Router()

// Public routes
router.post('/login', loginController)

// Protected routes
router.post('/register', authenticate, requireAdmin, registerController)
router.get('/me', authenticate, getMeController)

export default router
