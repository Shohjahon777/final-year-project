/**
 * Integration tests for admin submission routes (TDD)
 * - GET /api/admin/submissions returns 401 without auth
 * - GET /api/admin/submissions returns 403 for non-admin
 * - GET /api/admin/submissions?userId=xxx calls service with userId filter and returns data
 */
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../app'
import * as adminService from '../services/admin.service'

jest.mock('../services/admin.service')

const mockedAdminService = adminService as jest.Mocked<typeof adminService>

function adminToken(overrides?: { id?: string }) {
  return jwt.sign(
    { id: overrides?.id ?? 'admin1', email: 'admin@test.edu', role: 'admin' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  )
}

function facultyToken() {
  return jwt.sign(
    { id: 'fac1', email: 'fac@test.edu', role: 'faculty' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  )
}

describe('GET /api/admin/submissions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when no Authorization header', async () => {
    const res = await request(app).get('/api/admin/submissions')
    expect(res.status).toBe(401)
    expect(mockedAdminService.getAllSubmissions).not.toHaveBeenCalled()
  })

  it('returns 403 when user is not admin', async () => {
    const res = await request(app)
      .get('/api/admin/submissions')
      .set('Authorization', `Bearer ${facultyToken()}`)
    expect(res.status).toBe(403)
    expect(mockedAdminService.getAllSubmissions).not.toHaveBeenCalled()
  })

  it('calls getAllSubmissions with userId when query param provided and returns data', async () => {
    const userId = '507f1f77bcf86cd799439011'
    mockedAdminService.getAllSubmissions.mockResolvedValue({
      submissions: [
        {
          _id: 'sub1',
          userId: { _id: userId, firstName: 'John', lastName: 'Doe', email: 'j@test.edu' },
          category: 'research',
          subcategory: 'journal',
          title: 'Paper',
          evidence: { type: 'link', value: 'http://x.com' },
          metadata: {},
          calculatedPoints: 10,
          status: 'pending',
          submittedAt: new Date(),
        },
      ] as unknown as Awaited<ReturnType<typeof adminService.getAllSubmissions>>['submissions'],
      counts: { total: 1, pending: 1, approved: 0, rejected: 0, changes_requested: 0, totalPoints: 0 },
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    })

    const res = await request(app)
      .get('/api/admin/submissions')
      .query({ userId })
      .set('Authorization', `Bearer ${adminToken()}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.submissions).toHaveLength(1)
    expect(res.body.data.submissions[0].userId._id).toBe(userId)
    expect(mockedAdminService.getAllSubmissions).toHaveBeenCalledWith(
      expect.objectContaining({ userId })
    )
  })
})

describe('POST /api/admin/scores/recalculate/:userId', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when no Authorization header', async () => {
    const res = await request(app).post('/api/admin/scores/recalculate/507f1f77bcf86cd799439011')
    expect(res.status).toBe(401)
    expect(mockedAdminService.recalculateScore).not.toHaveBeenCalled()
  })

  it('returns 403 when user is not admin', async () => {
    const res = await request(app)
      .post('/api/admin/scores/recalculate/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${facultyToken()}`)
    expect(res.status).toBe(403)
    expect(mockedAdminService.recalculateScore).not.toHaveBeenCalled()
  })

  it('returns 200 and recalculated score when admin', async () => {
    mockedAdminService.recalculateScore.mockResolvedValue({
      research: 40,
      teaching: 20,
      admin: 10,
      outreach: 5,
      totalPenalties: -2,
      finalScore: 73,
      outcome: 'satisfactory',
    } as Awaited<ReturnType<typeof adminService.recalculateScore>>)
    const userId = '507f1f77bcf86cd799439011'
    const res = await request(app)
      .post(`/api/admin/scores/recalculate/${userId}`)
      .set('Authorization', `Bearer ${adminToken()}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.score.finalScore).toBe(73)
    expect(res.body.data.score.outcome).toBe('satisfactory')
    expect(mockedAdminService.recalculateScore).toHaveBeenCalledWith(userId)
  })
})
