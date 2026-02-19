import { Request, Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import * as configService from '../services/config.service'
import { AppError } from '../middleware/error.middleware'

/**
 * GET /api/config
 */
export async function getAllConfigurations(req: Request, res: Response) {
  try {
    const configs = await configService.getAllConfigurations()
    res.json({
      success: true,
      data: configs,
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to fetch configurations', 500)
  }
}

/**
 * GET /api/config/category/:category
 */
export async function getConfigurationsByCategory(req: Request, res: Response) {
  try {
    const { category } = req.params
    const configs = await configService.getConfigurationsByCategory(category)
    res.json({
      success: true,
      data: configs,
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to fetch configurations', 500)
  }
}

/**
 * GET /api/config/key/:key
 */
export async function getConfigurationByKey(req: Request, res: Response) {
  try {
    const { key } = req.params
    const config = await configService.getConfigurationByKey(key)
    res.json({
      success: true,
      data: config,
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to fetch configuration', 500)
  }
}

/**
 * PUT /api/config/:key
 */
export async function updateConfiguration(req: AuthRequest, res: Response) {
  try {
    const { key } = req.params
    const { value } = req.body
    const adminId = req.user!.id

    if (value === undefined) {
      throw new AppError('Value is required', 400)
    }

    const config = await configService.updateConfiguration(key, value, adminId)
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: config,
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to update configuration', 500)
  }
}

/**
 * GET /api/config/multipliers
 */
export async function getMultipliers(req: Request, res: Response) {
  try {
    const multipliers = await configService.getMultipliers()
    res.json({
      success: true,
      data: multipliers,
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to fetch multipliers', 500)
  }
}

/**
 * GET /api/config/ceilings
 */
export async function getCeilings(req: Request, res: Response) {
  try {
    const ceilings = await configService.getCeilings()
    res.json({
      success: true,
      data: ceilings,
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to fetch ceilings', 500)
  }
}

/**
 * POST /api/config/seed
 */
export async function seedConfigurations(req: AuthRequest, res: Response) {
  try {
    const result = await configService.seedDefaultConfigurations()
    res.json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    const msg = error instanceof Error ? error.message : 'Failed to seed configurations'
    throw new AppError(msg, 500)
  }
}
