import express from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.middleware'
import * as adminController from '../controllers/admin.controller'

const router = express.Router()

// All routes require authentication and admin role
router.use(authenticate)
router.use(requireAdmin)

// Dashboard
router.get('/dashboard', adminController.getDashboard)

// Faculty Management
router.get('/faculty', adminController.getAllFaculty)
router.get('/faculty/:id', adminController.getFacultyById)

// Submission Management
router.get('/submissions', adminController.getAllSubmissions)
router.get('/submissions/:id', adminController.getSubmissionById)
router.put('/submissions/:id/approve', adminController.approveSubmission)
router.put('/submissions/:id/reject', adminController.rejectSubmission)
router.put('/submissions/:id/request-changes', adminController.requestChanges)
router.put('/submissions/:id/points', adminController.adjustSubmissionPoints)

// Penalty Management
router.get('/penalties', adminController.getAllPenalties)
router.post('/penalties', adminController.createPenalty)
router.put('/penalties/:id', adminController.updatePenalty)
router.delete('/penalties/:id', adminController.deletePenalty)

// Scores
router.get('/scores', adminController.getAllScores)
router.post('/scores/recalculate/:userId', adminController.recalculateScore)

export default router
