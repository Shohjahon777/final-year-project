/**
 * Unit tests for admin.service (calculations)
 * - recalculateScore: sums approved submissions by category, applies ceilings, adds penalties, determines outcome
 */
import { recalculateScore } from '../services/admin.service'
import Submission from '../models/Submission'
import Penalty from '../models/Penalty'
import Score from '../models/Score'
import Configuration from '../models/Configuration'

jest.mock('../models/Submission')
jest.mock('../models/Penalty')
jest.mock('../models/Score')
jest.mock('../models/Configuration')

const mockedSubmission = Submission as jest.Mocked<typeof Submission>
const mockedPenalty = Penalty as jest.Mocked<typeof Penalty>
const mockedScore = Score as jest.Mocked<typeof Score>
const mockedConfig = Configuration as jest.Mocked<typeof Configuration>

describe('admin.service recalculateScore', () => {
  const userId = '507f1f77bcf86cd799439011'
  let submissionLeanMock: jest.Mock
  let penaltyLeanMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    submissionLeanMock = jest.fn()
    penaltyLeanMock = jest.fn()
    mockedSubmission.find = jest.fn().mockReturnValue({ lean: submissionLeanMock })
    mockedPenalty.find = jest.fn().mockReturnValue({ lean: penaltyLeanMock })
    mockedScore.findOneAndUpdate = jest.fn().mockResolvedValue({})
    mockedConfig.findOne = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })
  })

  it('sums approved submissions by category and applies ceilings', async () => {
    // Research: 25 + 20 = 45, capped at 40. Teaching: 15. Admin: 0. Outreach: 5.
    const submissions = [
      { category: 'research', calculatedPoints: 25, adjustedPoints: undefined },
      { category: 'research', calculatedPoints: 20, adjustedPoints: undefined },
      { category: 'teaching', calculatedPoints: 15, adjustedPoints: undefined },
      { category: 'outreach', calculatedPoints: 5, adjustedPoints: undefined },
    ]
    submissionLeanMock.mockResolvedValue(submissions)
    penaltyLeanMock.mockResolvedValue([])

    const result = await recalculateScore(userId)

    expect(result.research).toBe(40)
    expect(result.teaching).toBe(15)
    expect(result.admin).toBe(0)
    expect(result.outreach).toBe(5)
    expect(result.totalPenalties).toBe(0)
    expect(result.finalScore).toBe(40 + 15 + 0 + 5)
    expect(result.outcome).toBe('satisfactory')
    expect(mockedSubmission.find).toHaveBeenCalledWith({ userId, status: 'approved' })
    expect(mockedScore.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ userId }),
      expect.objectContaining({
        research: 40,
        teaching: 15,
        admin: 0,
        outreach: 5,
        totalPenalties: 0,
        outcome: 'satisfactory',
      }),
      { upsert: true, new: true }
    )
  })

  it('uses adjustedPoints when present', async () => {
    const submissions = [
      { category: 'research', calculatedPoints: 10, adjustedPoints: 15 },
    ]
    ;(mockedSubmission.find as jest.Mock)().lean.mockResolvedValue(submissions)
    ;(mockedPenalty.find as jest.Mock)().lean.mockResolvedValue([])

    const result = await recalculateScore(userId)

    expect(result.research).toBe(15)
    expect(result.finalScore).toBe(15)
  })

  it('includes penalties in finalScore (penalties are typically negative)', async () => {
    submissionLeanMock.mockResolvedValue([
      { category: 'research', calculatedPoints: 30, adjustedPoints: undefined },
    ])
    penaltyLeanMock.mockResolvedValue([
      { points: -5 },
      { points: -3 },
    ])

    const result = await recalculateScore(userId)

    expect(result.totalPenalties).toBe(-8)
    expect(result.finalScore).toBe(Math.max(0, 30 + (-8)))
    expect(result.finalScore).toBe(22)
    expect(result.outcome).toBe('contract_risk')
  })

  it('determines outcome: outstanding (>=80), satisfactory (>=60), improvement_plan (>=40), contract_risk (<40)', async () => {
    penaltyLeanMock.mockResolvedValue([])

    submissionLeanMock.mockResolvedValue([
      { category: 'research', calculatedPoints: 40, adjustedPoints: undefined },
      { category: 'teaching', calculatedPoints: 30, adjustedPoints: undefined },
      { category: 'admin', calculatedPoints: 10, adjustedPoints: undefined },
    ])
    let result = await recalculateScore(userId)
    expect(result.finalScore).toBe(80)
    expect(result.outcome).toBe('outstanding')

    submissionLeanMock.mockResolvedValue([
      { category: 'research', calculatedPoints: 30, adjustedPoints: undefined },
      { category: 'teaching', calculatedPoints: 30, adjustedPoints: undefined },
    ])
    result = await recalculateScore(userId)
    expect(result.finalScore).toBe(60)
    expect(result.outcome).toBe('satisfactory')

    submissionLeanMock.mockResolvedValue([
      { category: 'research', calculatedPoints: 25, adjustedPoints: undefined },
      { category: 'teaching', calculatedPoints: 15, adjustedPoints: undefined },
    ])
    result = await recalculateScore(userId)
    expect(result.finalScore).toBe(40)
    expect(result.outcome).toBe('improvement_plan')

    submissionLeanMock.mockResolvedValue([
      { category: 'research', calculatedPoints: 20, adjustedPoints: undefined },
    ])
    result = await recalculateScore(userId)
    expect(result.finalScore).toBe(20)
    expect(result.outcome).toBe('contract_risk')
  })

  it('finalScore is never negative', async () => {
    submissionLeanMock.mockResolvedValue([])
    penaltyLeanMock.mockResolvedValue([{ points: -100 }])

    const result = await recalculateScore(userId)

    expect(result.finalScore).toBe(0)
    expect(result.outcome).toBe('contract_risk')
  })
})
