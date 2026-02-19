import express from 'express'
import { authenticate, requireAdmin, requireFaculty } from '../middleware/auth.middleware'
import * as vacationController from '../controllers/vacation.controller'

const router = express.Router()

// Faculty routes (any authenticated user)
router.post('/', authenticate, requireFaculty, vacationController.createRequest)
router.get('/my', authenticate, requireFaculty, vacationController.getMyRequests)
router.delete('/:id', authenticate, requireFaculty, vacationController.cancelRequest)

// Admin routes
router.get('/', authenticate, requireAdmin, vacationController.getAllRequests)
router.patch('/:id/review', authenticate, requireAdmin, vacationController.reviewRequest)

export default router
