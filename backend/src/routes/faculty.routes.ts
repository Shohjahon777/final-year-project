import express from 'express'
import { authenticate, requireFaculty } from '../middleware/auth.middleware'
import * as facultyController from '../controllers/faculty.controller'

const router = express.Router()

// All routes require authentication and faculty role
router.use(authenticate)
router.use(requireFaculty)

// Dashboard
router.get('/dashboard', facultyController.getDashboard)

// Submissions
router.get('/submissions', facultyController.getSubmissions)
router.get('/submissions/:id', facultyController.getSubmissionById)
router.post('/submissions', facultyController.createSubmission)
router.put('/submissions/:id', facultyController.updateSubmission)
router.delete('/submissions/:id', facultyController.deleteSubmission)

// Scores
router.get('/scores', facultyController.getScores)

// Penalties
router.get('/penalties', facultyController.getPenalties)

export default router
