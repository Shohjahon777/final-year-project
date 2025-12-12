import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import * as facultyService from '../services/faculty.service'
import { AppError } from '../middleware/error.middleware'

/**
 * GET /api/faculty/dashboard
 */
export async function getDashboard(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id
    const dashboard = await facultyService.getFacultyDashboard(userId)

    res.json({
      success: true,
      data: dashboard,
    })
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to fetch dashboard', 500)
  }
}

/**
 * GET /api/faculty/submissions
 */
export async function getSubmissions(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id
    const { status, category, page, limit } = req.query

    const result = await facultyService.getFacultySubmissions(userId, {
      status: status as string | undefined,
      category: category as string | undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    })

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to fetch submissions', 500)
  }
}

/**
 * GET /api/faculty/submissions/:id
 */
export async function getSubmissionById(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id
    const { id } = req.params

    const submission = await facultyService.getSubmissionById(id, userId)

    res.json({
      success: true,
      data: { submission },
    })
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to fetch submission', 500)
  }
}

/**
 * POST /api/faculty/submissions
 */
export async function createSubmission(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id
    const { category, subcategory, title, description, evidence, metadata } =
      req.body

    // Validation
    if (!category || !subcategory || !title || !evidence) {
      throw new AppError(
        'Missing required fields: category, subcategory, title, evidence',
        400
      )
    }

    if (!['research', 'teaching', 'admin', 'outreach'].includes(category)) {
      throw new AppError('Invalid category', 400)
    }

    if (!evidence.type || !evidence.value) {
      throw new AppError('Evidence must have type and value', 400)
    }

    const submission = await facultyService.createSubmission(userId, {
      category,
      subcategory,
      title,
      description,
      evidence,
      metadata,
    })

    res.status(201).json({
      success: true,
      data: { submission },
    })
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to create submission', 500)
  }
}

/**
 * PUT /api/faculty/submissions/:id
 */
export async function updateSubmission(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id
    const { id } = req.params
    const { title, description, evidence, metadata } = req.body

    const submission = await facultyService.updateSubmission(id, userId, {
      title,
      description,
      evidence,
      metadata,
    })

    res.json({
      success: true,
      data: { submission },
    })
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to update submission', 500)
  }
}

/**
 * DELETE /api/faculty/submissions/:id
 */
export async function deleteSubmission(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id
    const { id } = req.params

    await facultyService.deleteSubmission(id, userId)

    res.json({
      success: true,
      message: 'Submission deleted successfully',
    })
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to delete submission', 500)
  }
}

/**
 * GET /api/faculty/scores
 */
export async function getScores(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id
    const scores = await facultyService.getFacultyScores(userId)

    res.json({
      success: true,
      data: { scores },
    })
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to fetch scores', 500)
  }
}

/**
 * GET /api/faculty/penalties
 */
export async function getPenalties(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id
    const penalties = await facultyService.getFacultyPenalties(userId)

    res.json({
      success: true,
      data: { penalties },
    })
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to fetch penalties', 500)
  }
}
