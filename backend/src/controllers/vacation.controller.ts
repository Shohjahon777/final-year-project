import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import * as vacationService from '../services/vacation.service'
import { AppError } from '../middleware/error.middleware'

/**
 * POST /api/vacations
 * Faculty: submit a vacation request
 */
export async function createRequest(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id
    const { startDate, endDate, reason, type } = req.body

    if (!startDate || !endDate || !reason) {
      throw new AppError('startDate, endDate, and reason are required', 400)
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AppError('Invalid date format', 400)
    }
    if (end < start) {
      throw new AppError('endDate cannot be before startDate', 400)
    }

    const vacation = await vacationService.createVacationRequest(userId, {
      startDate: start,
      endDate: end,
      reason,
      type: type || 'annual',
    })

    res.status(201).json({ success: true, data: vacation })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to submit vacation request', 500)
  }
}

/**
 * GET /api/vacations/my
 * Faculty: get own vacation requests
 */
export async function getMyRequests(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id
    const vacations = await vacationService.getMyVacations(userId)
    res.json({ success: true, data: vacations })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to fetch vacation requests', 500)
  }
}

/**
 * GET /api/vacations
 * Admin: get all vacation requests
 */
export async function getAllRequests(req: AuthRequest, res: Response) {
  try {
    const { status, page, limit } = req.query
    const result = await vacationService.getAllVacations({
      status: status as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    })
    res.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to fetch vacation requests', 500)
  }
}

/**
 * DELETE /api/vacations/:id
 * Faculty: cancel own pending request
 */
export async function cancelRequest(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const vacation = await vacationService.cancelVacationRequest(id, userId)
    res.json({ success: true, data: vacation })
  } catch (error) {
    if (error instanceof AppError) throw error
    const msg = error instanceof Error ? error.message : 'Failed to cancel vacation request'
    throw new AppError(msg, 400)
  }
}

/**
 * PATCH /api/vacations/:id/review
 * Admin: approve or reject a vacation request
 */
export async function reviewRequest(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params
    const { action, comment } = req.body

    if (!action || !['approved', 'rejected'].includes(action)) {
      throw new AppError('action must be "approved" or "rejected"', 400)
    }

    const vacation = await vacationService.reviewVacation(
      id,
      req.user!.id,
      action,
      comment
    )

    res.json({ success: true, data: vacation })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to review vacation request', 500)
  }
}
