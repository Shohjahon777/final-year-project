import express from 'express'
import { authenticate, requireFaculty } from '../middleware/auth.middleware'
import * as facultyController from '../controllers/faculty.controller'
import {
  createSubmissionValidator,
  updateSubmissionValidator,
  submissionIdValidator,
} from '../validators/submission.validator'

const router = express.Router()

// All routes require authentication and faculty role
router.use(authenticate)
router.use(requireFaculty)

// Dashboard
router.get('/dashboard', facultyController.getDashboard)

// Submissions with validation
router.get('/submissions', facultyController.getSubmissions)
router.get('/submissions/:id', submissionIdValidator, facultyController.getSubmissionById)
router.post('/submissions', createSubmissionValidator, facultyController.createSubmission)
router.put('/submissions/:id', updateSubmissionValidator, facultyController.updateSubmission)
router.delete('/submissions/:id', submissionIdValidator, facultyController.deleteSubmission)

// Scores
router.get('/scores', facultyController.getScores)

// Penalties
router.get('/penalties', facultyController.getPenalties)

export default router
