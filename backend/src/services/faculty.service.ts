import Submission, { ISubmission } from '../models/Submission'
import Score, { IScore } from '../models/Score'
import Penalty from '../models/Penalty'
import User from '../models/User'
import { AppError } from '../middleware/error.middleware'
import mongoose from 'mongoose'
import { getCurrentAcademicYear } from '../utils/academicYear'
import { scoringService } from './scoring.service'

/**
 * Get faculty dashboard summary
 */
export async function getFacultyDashboard(userId: string) {
  const currentYear = await getCurrentAcademicYear()

  // Get current score
  const score = await Score.findOne({
    userId,
    academicYear: currentYear,
  })

  // Get submission counts
  const submissionCounts = await Submission.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ])

  const counts = {
    pending: 0,
    approved: 0,
    rejected: 0,
  }

  submissionCounts.forEach((item) => {
    counts[item._id as keyof typeof counts] = item.count
  })

  // Get recent penalties (last 5)
  const recentPenalties = await Penalty.find({ userId })
    .sort({ appliedAt: -1 })
    .limit(5)
    .select('type description points appliedAt')
    .lean()

  return {
    scores: score
      ? {
          research: score.research,
          teaching: score.teaching,
          admin: score.admin,
          outreach: score.outreach,
          totalPenalties: score.totalPenalties,
          finalScore: score.finalScore,
          outcome: score.outcome,
        }
      : {
          research: 0,
          teaching: 0,
          admin: 0,
          outreach: 0,
          totalPenalties: 0,
          finalScore: 0,
          outcome: 'contract_risk' as const,
        },
    pendingSubmissions: counts.pending,
    approvedSubmissions: counts.approved,
    rejectedSubmissions: counts.rejected,
    recentPenalties,
  }
}

/**
 * Get all submissions for a faculty member
 */
export async function getFacultySubmissions(
  userId: string,
  filters: {
    status?: string
    category?: string
    page?: number
    limit?: number
  }
) {
  const page = filters.page || 1
  const limit = filters.limit || 10
  const skip = (page - 1) * limit

  const query: any = { userId }

  if (filters.status) {
    query.status = filters.status
  }

  if (filters.category) {
    query.category = filters.category
  }

  const [submissions, total] = await Promise.all([
    Submission.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Submission.countDocuments(query),
  ])

  return {
    submissions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

/**
 * Get single submission by ID
 */
export async function getSubmissionById(
  submissionId: string,
  userId: string
): Promise<ISubmission> {
  const submission = await Submission.findOne({
    _id: submissionId,
    userId,
  })

  if (!submission) {
    throw new AppError('Submission not found', 404)
  }

  return submission
}

/**
 * Create new submission
 */
export async function createSubmission(
  userId: string,
  submissionData: {
    category: 'research' | 'teaching' | 'admin' | 'outreach'
    subcategory: string
    title: string
    description?: string
    evidence: {
      type: 'link' | 'file' | 'text'
      value: string
    }
    metadata?: Record<string, any>
  }
): Promise<ISubmission> {
  // Get user for scoring calculation
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError('User not found', 404)
  }

  // Validate metadata for the submission type
  const metadataErrors = scoringService.validateMetadata(
    submissionData.category,
    submissionData.subcategory,
    submissionData.metadata || {}
  )

  if (metadataErrors.length > 0) {
    throw new AppError(
      `Invalid metadata: ${metadataErrors.join(', ')}`,
      400
    )
  }

  // Calculate points using the scoring engine
  const calculatedPoints = await scoringService.calculatePoints(
    submissionData,
    user
  )

  const submission = new Submission({
    userId,
    ...submissionData,
    calculatedPoints,
    status: 'pending',
    academicYear: await getCurrentAcademicYear(),
    submittedAt: new Date(),
  })

  await submission.save()
  return submission
}

/**
 * Update submission (only if pending)
 */
export async function updateSubmission(
  submissionId: string,
  userId: string,
  updateData: {
    title?: string
    description?: string
    evidence?: {
      type: 'link' | 'file' | 'text'
      value: string
    }
    metadata?: Record<string, any>
  }
): Promise<ISubmission> {
  const submission = await Submission.findOne({
    _id: submissionId,
    userId,
  })

  if (!submission) {
    throw new AppError('Submission not found', 404)
  }

  if (submission.status !== 'pending' && submission.status !== 'changes_requested') {
    throw new AppError(
      'Cannot update submission that is not pending or awaiting changes',
      400
    )
  }

  // Update fields
  if (updateData.title) submission.title = updateData.title
  if (updateData.description !== undefined)
    submission.description = updateData.description
  if (updateData.evidence) submission.evidence = updateData.evidence
  if (updateData.metadata) {
    // Merge metadata
    Object.assign(submission.metadata, updateData.metadata)
  }

  // When professor resubmits after changes requested, set back to pending (keep adminNotes for reference)
  if (submission.status === 'changes_requested') {
    submission.status = 'pending'
  }

  await submission.save()
  return submission
}

/**
 * Delete submission (only if pending)
 */
export async function deleteSubmission(
  submissionId: string,
  userId: string
): Promise<void> {
  const submission = await Submission.findOne({
    _id: submissionId,
    userId,
  })

  if (!submission) {
    throw new AppError('Submission not found', 404)
  }

  if (submission.status !== 'pending') {
    throw new AppError(
      'Cannot delete submission that is not pending',
      400
    )
  }

  await Submission.deleteOne({ _id: submissionId })
}

/**
 * Get faculty scores
 */
export async function getFacultyScores(userId: string) {
  const scores = await Score.find({ userId })
    .sort({ academicYear: -1 })
    .lean()

  return scores
}

/**
 * Get faculty penalties
 */
export async function getFacultyPenalties(userId: string) {
  const penalties = await Penalty.find({ userId })
    .sort({ appliedAt: -1 })
    .lean()

  return penalties
}

