import mongoose from 'mongoose'
import Vacation from '../models/Vacation'

export async function createVacationRequest(
  userId: string,
  data: {
    startDate: Date
    endDate: Date
    reason: string
    type: 'annual' | 'sick' | 'unpaid' | 'other'
  }
) {
  const vacation = new Vacation({ userId, ...data })
  await vacation.save()
  return vacation.populate('userId', 'firstName lastName email department facultyRank')
}

export async function getMyVacations(userId: string) {
  return Vacation.find({ userId }).sort({ createdAt: -1 }).lean()
}

export async function getAllVacations(params: {
  status?: string
  page?: number
  limit?: number
}) {
  const { status, page = 1, limit = 20 } = params
  const query: Record<string, unknown> = {}
  if (status && status !== 'all') query.status = status

  const [vacations, total] = await Promise.all([
    Vacation.find(query)
      .populate('userId', 'firstName lastName email department facultyRank')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Vacation.countDocuments(query),
  ])

  return {
    vacations,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  }
}

export async function cancelVacationRequest(id: string, userId: string) {
  const vacation = await Vacation.findOne({ _id: id, userId })
  if (!vacation) throw new Error('Vacation request not found')
  if (vacation.status !== 'pending') throw new Error('Only pending requests can be cancelled')

  vacation.status = 'cancelled' as any
  await vacation.save()
  return vacation
}

export async function reviewVacation(
  id: string,
  adminId: string,
  action: 'approved' | 'rejected',
  comment?: string
) {
  const vacation = await Vacation.findById(id)
  if (!vacation) throw new Error('Vacation request not found')

  vacation.status = action
  if (comment) vacation.adminComment = comment
  vacation.reviewedBy = new mongoose.Types.ObjectId(adminId)
  vacation.reviewedAt = new Date()

  await vacation.save()
  return vacation.populate([
    { path: 'userId', select: 'firstName lastName email' },
    { path: 'reviewedBy', select: 'firstName lastName' },
  ])
}
