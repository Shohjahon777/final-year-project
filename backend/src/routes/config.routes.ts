import express from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.middleware'
import * as configController from '../controllers/config.controller'

const router = express.Router()

// Public routes (for frontend to get point values)
router.get('/', configController.getAllConfigurations)
router.get('/multipliers', configController.getMultipliers)
router.get('/ceilings', configController.getCeilings)
router.get('/category/:category', configController.getConfigurationsByCategory)
router.get('/key/:key', configController.getConfigurationByKey)

// Admin-only routes
router.put('/:key', authenticate, requireAdmin, configController.updateConfiguration)
router.post('/seed', authenticate, requireAdmin, configController.seedConfigurations)

export default router
