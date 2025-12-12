import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import * as adminService from '../services/admin.service'
import { AppError } from '../middleware/error.middleware'

/**
 * GET /api/admin/dashboard
 */
export async function getDashboard(req: AuthRequest, res: Response) {
  try {
    const dashboard = await adminService.getAdminDashboard()
    res.json({
      success: true,
      data: dashboard,
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to fetch admin dashboard', 500)
  }
}

/**
 * GET /api/admin/faculty
 */
export async function getAllFaculty(req: AuthRequest, res: Response) {
  try {
    const { search, department, rank, page, limit } = req.query
    const result = await adminService.getAllFaculty({
      search: search as string,
      department: department as string,
      rank: rank as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    })
    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to fetch faculty', 500)
  }
}

/**
 * GET /api/admin/faculty/:id
 */
export async function getFacultyById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params
    const result = await adminService.getFacultyById(id)
    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to fetch faculty', 500)
  }
}

/**
 * GET /api/admin/submissions
 */
export async function getAllSubmissions(req: AuthRequest, res: Response) {
  try {
    const { status, category, userId, page, limit } = req.query
    const result = await adminService.getAllSubmissions({
      status: status as string,
      category: category as string,
      userId: userId as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    })
    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to fetch submissions', 500)
  }
}

/**
 * GET /api/admin/submissions/:id
 */
export async function getSubmissionById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params
    const submission = await adminService.getSubmissionById(id)
    res.json({
      success: true,
      data: { submission },
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to fetch submission', 500)
  }
}

/**
 * PUT /api/admin/submissions/:id/approve
 */
export async function approveSubmission(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params
    const { notes, adjustedPoints } = req.body
    const adminId = req.user!.id

    const submission = await adminService.approveSubmission(id, adminId, {
      notes,
      adjustedPoints,
    })

    res.json({
      success: true,
      message: 'Submission approved successfully',
      data: { submission },
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to approve submission', 500)
  }
}

/**
 * PUT /api/admin/submissions/:id/reject
 */
export async function rejectSubmission(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params
    const { notes } = req.body
    const adminId = req.user!.id

    if (!notes) {
      throw new AppError('Rejection notes are required', 400)
    }

    const submission = await adminService.rejectSubmission(id, adminId, { notes })

    res.json({
      success: true,
      message: 'Submission rejected',
      data: { submission },
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to reject submission', 500)
  }
}

/**
 * PUT /api/admin/submissions/:id/points
 */
export async function adjustSubmissionPoints(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params
    const { adjustedPoints } = req.body
    const adminId = req.user!.id

    if (adjustedPoints === undefined) {
      throw new AppError('Adjusted points value is required', 400)
    }

    const submission = await adminService.adjustSubmissionPoints(id, adminId, adjustedPoints)

    res.json({
      success: true,
      message: 'Points adjusted successfully',
      data: { submission },
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to adjust points', 500)
  }
}

/**
 * GET /api/admin/penalties
 */
export async function getAllPenalties(req: AuthRequest, res: Response) {
  try {
    const { userId, type, academicYear, page, limit } = req.query
    const result = await adminService.getAllPenalties({
      userId: userId as string,
      type: type as string,
      academicYear: academicYear as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    })
    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to fetch penalties', 500)
  }
}

/**
 * POST /api/admin/penalties
 */
export async function createPenalty(req: AuthRequest, res: Response) {
  try {
    const { userId, type, description, points, evidence } = req.body
    const adminId = req.user!.id

    if (!userId || !type || !description || points === undefined) {
      throw new AppError('Missing required fields: userId, type, description, points', 400)
    }

    if (!['meeting', 'deadline', 'academic_dishonesty'].includes(type)) {
      throw new AppError('Invalid penalty type', 400)
    }

    const penalty = await adminService.createPenalty(adminId, {
      userId,
      type,
      description,
      points,
      evidence,
    })

    res.status(201).json({
      success: true,
      message: 'Penalty applied successfully',
      data: { penalty },
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to create penalty', 500)
  }
}

/**
 * PUT /api/admin/penalties/:id
 */
export async function updatePenalty(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params
    const { description, points, evidence } = req.body

    const penalty = await adminService.updatePenalty(id, {
      description,
      points,
      evidence,
    })

    res.json({
      success: true,
      message: 'Penalty updated successfully',
      data: { penalty },
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to update penalty', 500)
  }
}

/**
 * DELETE /api/admin/penalties/:id
 */
export async function deletePenalty(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params
    await adminService.deletePenalty(id)
    res.json({
      success: true,
      message: 'Penalty deleted successfully',
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to delete penalty', 500)
  }
}

/**
 * GET /api/admin/scores
 */
export async function getAllScores(req: AuthRequest, res: Response) {
  try {
    const { academicYear, outcome, page, limit } = req.query
    const result = await adminService.getAllScores({
      academicYear: academicYear as string,
      outcome: outcome as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    })
    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to fetch scores', 500)
  }
}

/**
 * POST /api/admin/scores/recalculate/:userId
 */
export async function recalculateScore(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params
    const result = await adminService.recalculateScore(userId)
    res.json({
      success: true,
      message: 'Score recalculated successfully',
      data: { score: result },
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Failed to recalculate score', 500)
  }
}
