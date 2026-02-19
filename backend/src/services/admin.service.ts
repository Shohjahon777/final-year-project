import User, { IUser } from '../models/User'
import Submission, { ISubmission } from '../models/Submission'
import Score, { IScore } from '../models/Score'
import Penalty, { IPenalty } from '../models/Penalty'
import Configuration from '../models/Configuration'
import { AppError } from '../middleware/error.middleware'
import mongoose from 'mongoose'
import { getCurrentAcademicYear } from '../utils/academicYear'

/**
 * Determine outcome based on final score
 */
function determineOutcome(finalScore: number): 'outstanding' | 'satisfactory' | 'improvement_plan' | 'contract_risk' {
  // Outcome bands per README requirements:
  // Outstanding: 80-100, Satisfactory: 60-79, Improvement Plan: 50-59, Contract Risk: <50
  if (finalScore >= 80) return 'outstanding'
  if (finalScore >= 60) return 'satisfactory'
  if (finalScore >= 50) return 'improvement_plan' // Fixed: was 40
  return 'contract_risk'
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboard() {
  const currentYear = await getCurrentAcademicYear()

  // Get total faculty count
  const totalFaculty = await User.countDocuments({ role: 'faculty', isActive: true })

  // Get pending submissions count
  const pendingSubmissions = await Submission.countDocuments({ status: 'pending' })

  // Get average score for current year
  const scoreStats = await Score.aggregate([
    { $match: { academicYear: currentYear } },
    {
      $group: {
        _id: null,
        avgScore: { $avg: '$finalScore' },
        totalScores: { $sum: 1 },
      },
    },
  ])

  const averageScore = scoreStats[0]?.avgScore || 0

  // Get outcome distribution
  const outcomeDistribution = await Score.aggregate([
    { $match: { academicYear: currentYear } },
    {
      $group: {
        _id: '$outcome',
        count: { $sum: 1 },
      },
    },
  ])

  // Get faculty at risk (contract_risk or improvement_plan)
  const atRiskCount = await Score.countDocuments({
    academicYear: currentYear,
    outcome: { $in: ['contract_risk', 'improvement_plan'] },
  })

  // Get recent submissions (last 10)
  const recentSubmissions = await Submission.find()
    .sort({ submittedAt: -1 })
    .limit(10)
    .populate('userId', 'firstName lastName email')
    .lean()

  // Get recent penalties (last 5)
  const recentPenalties = await Penalty.find()
    .sort({ appliedAt: -1 })
    .limit(5)
    .populate('userId', 'firstName lastName')
    .populate('appliedBy', 'firstName lastName')
    .lean()

  return {
    stats: {
      totalFaculty,
      pendingSubmissions,
      averageScore: Math.round(averageScore * 100) / 100,
      atRiskCount,
    },
    outcomeDistribution: outcomeDistribution.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {} as Record<string, number>),
    recentSubmissions,
    recentPenalties,
    academicYear: currentYear,
  }
}

/**
 * Get all faculty with pagination and filters
 */
export async function getAllFaculty(filters: {
  search?: string
  department?: string
  rank?: string
  page?: number
  limit?: number
}) {
  const page = filters.page || 1
  const limit = filters.limit || 10
  const skip = (page - 1) * limit

  const query: any = { role: 'faculty' }

  if (filters.search) {
    query.$or = [
      { firstName: { $regex: filters.search, $options: 'i' } },
      { lastName: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ]
  }

  if (filters.department) {
    query.department = filters.department
  }

  if (filters.rank) {
    query.facultyRank = filters.rank
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ lastName: 1, firstName: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ])

  // Get current scores for each faculty
  const currentYear = await getCurrentAcademicYear()
  const userIds = users.map((u) => u._id)
  const scores = await Score.find({
    userId: { $in: userIds },
    academicYear: currentYear,
  }).lean()

  const scoreMap = new Map(scores.map((s) => [s.userId.toString(), s]))

  const facultyWithScores = users.map((user) => ({
    ...user,
    currentScore: scoreMap.get(user._id.toString()) || null,
  }))

  return {
    faculty: facultyWithScores,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

/**
 * Get single faculty by ID with full details
 */
export async function getFacultyById(id: string) {
  const user = await User.findById(id).select('-password').lean()

  if (!user || user.role !== 'faculty') {
    throw new AppError('Faculty not found', 404)
  }

  // Get all scores
  const scores = await Score.find({ userId: id }).sort({ academicYear: -1 }).lean()

  // Get submission counts
  const submissionCounts = await Submission.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(id) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ])

  // Get penalties
  const penalties = await Penalty.find({ userId: id })
    .sort({ appliedAt: -1 })
    .populate('appliedBy', 'firstName lastName')
    .lean()

  return {
    user,
    scores,
    submissionCounts: submissionCounts.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {} as Record<string, number>),
    penalties,
  }
}

/**
 * Get all submissions with pagination and filters
 */
export async function getAllSubmissions(filters: {
  status?: string
  category?: string
  userId?: string
  submittedAfter?: string
  submittedBefore?: string
  page?: number
  limit?: number
}) {
  const page = filters.page || 1
  const limit = filters.limit || 10
  const skip = (page - 1) * limit

  const query: any = {}

  if (filters.status) {
    query.status = filters.status
  }

  if (filters.category) {
    query.category = filters.category
  }

  if (filters.userId) {
    query.userId = filters.userId
  }

  if (filters.submittedAfter || filters.submittedBefore) {
    query.submittedAt = {}
    if (filters.submittedAfter) {
      query.submittedAt.$gte = new Date(filters.submittedAfter)
    }
    if (filters.submittedBefore) {
      query.submittedAt.$lte = new Date(filters.submittedBefore)
    }
  }

  // Base query for counts (same filters but no status so we get all status counts)
  const countQuery: any = {}
  if (filters.category) countQuery.category = filters.category
  if (filters.userId) countQuery.userId = filters.userId
  if (filters.submittedAfter || filters.submittedBefore) {
    countQuery.submittedAt = {}
    if (filters.submittedAfter) countQuery.submittedAt.$gte = new Date(filters.submittedAfter)
    if (filters.submittedBefore) countQuery.submittedAt.$lte = new Date(filters.submittedBefore)
  }

  const [submissions, total, countByStatus, approvedPointsResult] = await Promise.all([
    Submission.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName email facultyRank department')
      .populate('reviewedBy', 'firstName lastName')
      .lean(),
    Submission.countDocuments(query),
    Submission.aggregate([
      { $match: countQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Submission.aggregate([
      { $match: { ...countQuery, status: 'approved' } },
      { $project: { pts: { $ifNull: ['$adjustedPoints', '$calculatedPoints'] } } },
      { $group: { _id: null, total: { $sum: '$pts' } } },
    ]),
  ])

  const counts = { total: 0, pending: 0, approved: 0, rejected: 0, changes_requested: 0, totalPoints: 0 }
  const totalAll = countByStatus.reduce((sum, item) => sum + item.count, 0)
  counts.total = totalAll
  countByStatus.forEach((item) => {
    (counts as any)[item._id] = item.count
  })
  if (approvedPointsResult[0]?.total != null) counts.totalPoints = approvedPointsResult[0].total

  return {
    submissions,
    counts,
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
export async function getSubmissionById(id: string) {
  const submission = await Submission.findById(id)
    .populate('userId', 'firstName lastName email facultyRank department')
    .populate('reviewedBy', 'firstName lastName')
    .lean()

  if (!submission) {
    throw new AppError('Submission not found', 404)
  }

  return submission
}

/**
 * Approve a submission
 */
export async function approveSubmission(
  submissionId: string,
  adminId: string,
  data: { notes?: string; adjustedPoints?: number }
) {
  const submission = await Submission.findById(submissionId)

  if (!submission) {
    throw new AppError('Submission not found', 404)
  }

  if (submission.status !== 'pending') {
    throw new AppError('Submission has already been reviewed', 400)
  }

  submission.status = 'approved'
  submission.reviewedAt = new Date()
  submission.reviewedBy = new mongoose.Types.ObjectId(adminId)
  if (data.notes) {
    submission.adminNotes = data.notes
  }
  if (data.adjustedPoints !== undefined) {
    submission.adjustedPoints = data.adjustedPoints
  }

  await submission.save()

  // Recalculate user's score
  await recalculateScore(submission.userId.toString())

  return submission
}

/**
 * Reject a submission
 */
export async function rejectSubmission(
  submissionId: string,
  adminId: string,
  data: { notes: string }
) {
  const submission = await Submission.findById(submissionId)

  if (!submission) {
    throw new AppError('Submission not found', 404)
  }

  if (submission.status !== 'pending') {
    throw new AppError('Submission has already been reviewed', 400)
  }

  submission.status = 'rejected'
  submission.reviewedAt = new Date()
  submission.reviewedBy = new mongoose.Types.ObjectId(adminId)
  submission.adminNotes = data.notes

  await submission.save()

  return submission
}

/**
 * Request changes on a submission (send back to professor for revision)
 */
export async function requestChanges(
  submissionId: string,
  adminId: string,
  data: { notes: string }
) {
  const submission = await Submission.findById(submissionId)

  if (!submission) {
    throw new AppError('Submission not found', 404)
  }

  if (submission.status !== 'pending') {
    throw new AppError('Submission has already been reviewed', 400)
  }

  submission.status = 'changes_requested'
  submission.reviewedAt = new Date()
  submission.reviewedBy = new mongoose.Types.ObjectId(adminId)
  submission.adminNotes = data.notes

  await submission.save()

  return submission
}

/**
 * Adjust points on an approved submission
 */
export async function adjustSubmissionPoints(
  submissionId: string,
  adminId: string,
  adjustedPoints: number
) {
  const submission = await Submission.findById(submissionId)

  if (!submission) {
    throw new AppError('Submission not found', 404)
  }

  if (submission.status !== 'approved') {
    throw new AppError('Can only adjust points on approved submissions', 400)
  }

  submission.adjustedPoints = adjustedPoints
  await submission.save()

  // Recalculate user's score
  await recalculateScore(submission.userId.toString())

  return submission
}

/**
 * Get all penalties with pagination and filters
 */
export async function getAllPenalties(filters: {
  userId?: string
  type?: string
  academicYear?: string
  page?: number
  limit?: number
}) {
  const page = filters.page || 1
  const limit = filters.limit || 10
  const skip = (page - 1) * limit

  const query: any = {}

  if (filters.userId) {
    query.userId = filters.userId
  }

  if (filters.type) {
    query.type = filters.type
  }

  if (filters.academicYear) {
    query.academicYear = filters.academicYear
  }

  const [penalties, total] = await Promise.all([
    Penalty.find(query)
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName email')
      .populate('appliedBy', 'firstName lastName')
      .lean(),
    Penalty.countDocuments(query),
  ])

  return {
    penalties,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

/**
 * Create a new penalty
 */
export async function createPenalty(
  adminId: string,
  data: {
    userId: string
    type: 'meeting' | 'deadline' | 'academic_dishonesty'
    description: string
    points: number
    evidence?: string
  }
) {
  // Verify faculty exists
  const user = await User.findById(data.userId)
  if (!user || user.role !== 'faculty') {
    throw new AppError('Faculty not found', 404)
  }

  // Points must be negative
  const points = data.points > 0 ? -data.points : data.points

  const penalty = new Penalty({
    userId: data.userId,
    type: data.type,
    description: data.description,
    points,
    appliedBy: adminId,
    appliedAt: new Date(),
    evidence: data.evidence,
    academicYear: await getCurrentAcademicYear(),
  })

  await penalty.save()

  // Recalculate user's score
  await recalculateScore(data.userId)

  return penalty
}

/**
 * Update a penalty
 */
export async function updatePenalty(
  penaltyId: string,
  data: {
    description?: string
    points?: number
    evidence?: string
  }
) {
  const penalty = await Penalty.findById(penaltyId)

  if (!penalty) {
    throw new AppError('Penalty not found', 404)
  }

  if (data.description) {
    penalty.description = data.description
  }
  if (data.points !== undefined) {
    penalty.points = data.points > 0 ? -data.points : data.points
  }
  if (data.evidence !== undefined) {
    penalty.evidence = data.evidence
  }

  await penalty.save()

  // Recalculate user's score
  await recalculateScore(penalty.userId.toString())

  return penalty
}

/**
 * Delete a penalty
 */
export async function deletePenalty(penaltyId: string) {
  const penalty = await Penalty.findById(penaltyId)

  if (!penalty) {
    throw new AppError('Penalty not found', 404)
  }

  const userId = penalty.userId.toString()
  await Penalty.deleteOne({ _id: penaltyId })

  // Recalculate user's score
  await recalculateScore(userId)

  return { message: 'Penalty deleted successfully' }
}

/**
 * Get all scores with pagination
 */
export async function getAllScores(filters: {
  academicYear?: string
  outcome?: string
  page?: number
  limit?: number
}) {
  const page = filters.page || 1
  const limit = filters.limit || 10
  const skip = (page - 1) * limit

  const query: any = {}

  if (filters.academicYear) {
    query.academicYear = filters.academicYear
  } else {
    query.academicYear = await getCurrentAcademicYear()
  }

  if (filters.outcome) {
    query.outcome = filters.outcome
  }

  const [scores, total] = await Promise.all([
    Score.find(query)
      .sort({ finalScore: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName email facultyRank department')
      .lean(),
    Score.countDocuments(query),
  ])

  return {
    scores,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

/**
 * Recalculate a faculty member's score
 */
export async function recalculateScore(userId: string) {
  const currentYear = await getCurrentAcademicYear()

  // Get all approved submissions for this user in current academic year ONLY
  const submissions = await Submission.find({
    userId,
    status: 'approved',
    academicYear: currentYear,
  }).lean()

  // Calculate category totals
  const categoryTotals = {
    research: 0,
    teaching: 0,
    admin: 0,
    outreach: 0,
  }

  // Fetch category ceilings from configuration (with fallback to hardcoded defaults)
  const ceilingsConfig = await Configuration.find({ category: 'ceilings' }).lean()
  const ceilings = {
    research: ceilingsConfig.find(c => c.key === 'research_ceiling')?.value as number || 40,
    teaching: ceilingsConfig.find(c => c.key === 'teaching_ceiling')?.value as number || 30,
    admin: ceilingsConfig.find(c => c.key === 'admin_ceiling')?.value as number || 20,
    outreach: ceilingsConfig.find(c => c.key === 'outreach_ceiling')?.value as number || 10,
  }

  for (const submission of submissions) {
    const points = submission.adjustedPoints ?? submission.calculatedPoints
    const category = submission.category as keyof typeof categoryTotals
    categoryTotals[category] += points
  }

  // Apply ceilings
  for (const category of Object.keys(categoryTotals) as Array<keyof typeof categoryTotals>) {
    categoryTotals[category] = Math.min(categoryTotals[category], ceilings[category])
  }

  // Calculate total penalties
  const penalties = await Penalty.find({
    userId,
    academicYear: currentYear,
  }).lean()

  const totalPenalties = penalties.reduce((sum, p) => sum + p.points, 0)

  // Calculate final score
  const totalPoints =
    categoryTotals.research +
    categoryTotals.teaching +
    categoryTotals.admin +
    categoryTotals.outreach

  const finalScore = Math.max(0, totalPoints + totalPenalties)
  const outcome = determineOutcome(finalScore)

  // Update or create score record
  await Score.findOneAndUpdate(
    { userId, academicYear: currentYear },
    {
      userId,
      academicYear: currentYear,
      research: categoryTotals.research,
      teaching: categoryTotals.teaching,
      admin: categoryTotals.admin,
      outreach: categoryTotals.outreach,
      totalPenalties,
      finalScore,
      outcome,
      calculatedAt: new Date(),
    },
    { upsert: true, new: true }
  )

  return {
    ...categoryTotals,
    totalPenalties,
    finalScore,
    outcome,
  }
}
