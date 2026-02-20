/**
 * Integration tests for faculty routes
 * - All routes require auth + faculty role (401 without token, 403 for admin)
 * - GET /dashboard, /submissions, /submissions/:id, /scores, /penalties return 200 with data
 * - POST /submissions, PUT /submissions/:id return 201/200
 */
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../app'
import * as facultyService from '../services/faculty.service'

jest.mock('../services/faculty.service')

const mockedFacultyService = facultyService as jest.Mocked<typeof facultyService>

function facultyToken(overrides?: { id?: string }) {
  return jwt.sign(
    { id: overrides?.id ?? 'fac1', email: 'fac@test.edu', role: 'faculty' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  )
}

function adminToken() {
  return jwt.sign(
    { id: 'admin1', email: 'admin@test.edu', role: 'admin' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  )
}

describe('Faculty routes auth', () => {
  beforeEach(() => jest.clearAllMocks())

  it('GET /api/faculty/dashboard returns 401 without Authorization', async () => {
    const res = await request(app).get('/api/faculty/dashboard')
    expect(res.status).toBe(401)
    expect(mockedFacultyService.getFacultyDashboard).not.toHaveBeenCalled()
  })

  it('GET /api/faculty/dashboard returns 200 for admin token (admin has faculty access)', async () => {
    mockedFacultyService.getFacultyDashboard.mockResolvedValue({
      scores: { research: 0, teaching: 0, admin: 0, outreach: 0, totalPenalties: 0, finalScore: 0, outcome: 'satisfactory' as const },
      pendingSubmissions: 0,
      approvedSubmissions: 0,
      rejectedSubmissions: 0,
      recentPenalties: [],
      recentSubmissions: [],
    } as unknown as Awaited<ReturnType<typeof facultyService.getFacultyDashboard>>)
    const res = await request(app)
      .get('/api/faculty/dashboard')
      .set('Authorization', `Bearer ${adminToken()}`)
    expect(res.status).toBe(200)
    expect(mockedFacultyService.getFacultyDashboard).toHaveBeenCalledWith('admin1')
  })
})

describe('GET /api/faculty/dashboard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 200 and dashboard data when faculty', async () => {
    mockedFacultyService.getFacultyDashboard.mockResolvedValue({
      scores: { research: 0, teaching: 0, admin: 0, outreach: 0, totalPenalties: 0, finalScore: 0, outcome: 'satisfactory' as const },
      pendingSubmissions: 2,
      approvedSubmissions: 5,
      rejectedSubmissions: 0,
      recentPenalties: [],
      recentSubmissions: [],
    } as unknown as Awaited<ReturnType<typeof facultyService.getFacultyDashboard>>)

    const res = await request(app)
      .get('/api/faculty/dashboard')
      .set('Authorization', `Bearer ${facultyToken()}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.pendingSubmissions).toBe(2)
    expect(mockedFacultyService.getFacultyDashboard).toHaveBeenCalledWith('fac1')
  })
})

describe('GET /api/faculty/submissions', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 200 and submissions when faculty', async () => {
    mockedFacultyService.getFacultySubmissions.mockResolvedValue({
      submissions: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    } as Awaited<ReturnType<typeof facultyService.getFacultySubmissions>>)

    const res = await request(app)
      .get('/api/faculty/submissions')
      .set('Authorization', `Bearer ${facultyToken()}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.submissions).toEqual([])
    expect(mockedFacultyService.getFacultySubmissions).toHaveBeenCalledWith('fac1', expect.any(Object))
  })
})

describe('GET /api/faculty/submissions/:id', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 200 and submission when faculty owns it', async () => {
    const submission = { _id: 'sub1', title: 'Paper', category: 'research', status: 'pending' }
    mockedFacultyService.getSubmissionById.mockResolvedValue(submission as unknown as Awaited<ReturnType<typeof facultyService.getSubmissionById>>)

    const res = await request(app)
      .get('/api/faculty/submissions/sub1')
      .set('Authorization', `Bearer ${facultyToken()}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.submission).toBeDefined()
    expect(mockedFacultyService.getSubmissionById).toHaveBeenCalledWith('sub1', 'fac1')
  })
})

describe('POST /api/faculty/submissions', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 201 when faculty creates submission', async () => {
    const created = { _id: 'sub2', title: 'New', category: 'research', status: 'pending' }
    mockedFacultyService.createSubmission.mockResolvedValue(created as unknown as Awaited<ReturnType<typeof facultyService.createSubmission>>)

    const res = await request(app)
      .post('/api/faculty/submissions')
      .set('Authorization', `Bearer ${facultyToken()}`)
      .send({ title: 'New', category: 'research', subcategory: 'journal', evidence: { type: 'link', value: 'http://x.com' } })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(mockedFacultyService.createSubmission).toHaveBeenCalledWith('fac1', expect.objectContaining({ title: 'New', category: 'research' }))
  })
})

describe('PUT /api/faculty/submissions/:id', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 200 when faculty updates submission', async () => {
    const updated = { _id: 'sub1', title: 'Updated', status: 'pending' }
    mockedFacultyService.updateSubmission.mockResolvedValue(updated as unknown as Awaited<ReturnType<typeof facultyService.updateSubmission>>)

    const res = await request(app)
      .put('/api/faculty/submissions/sub1')
      .set('Authorization', `Bearer ${facultyToken()}`)
      .send({ title: 'Updated' })

    expect(res.status).toBe(200)
    expect(mockedFacultyService.updateSubmission).toHaveBeenCalledWith('sub1', 'fac1', expect.any(Object))
  })
})

describe('GET /api/faculty/scores', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 200 and scores when faculty', async () => {
    mockedFacultyService.getFacultyScores.mockResolvedValue([] as Awaited<ReturnType<typeof facultyService.getFacultyScores>>)

    const res = await request(app)
      .get('/api/faculty/scores')
      .set('Authorization', `Bearer ${facultyToken()}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(mockedFacultyService.getFacultyScores).toHaveBeenCalledWith('fac1')
  })
})

describe('GET /api/faculty/penalties', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 200 and penalties when faculty', async () => {
    mockedFacultyService.getFacultyPenalties.mockResolvedValue([] as Awaited<ReturnType<typeof facultyService.getFacultyPenalties>>)

    const res = await request(app)
      .get('/api/faculty/penalties')
      .set('Authorization', `Bearer ${facultyToken()}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(mockedFacultyService.getFacultyPenalties).toHaveBeenCalledWith('fac1')
  })
})
