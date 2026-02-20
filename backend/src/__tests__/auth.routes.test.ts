/**
 * Integration tests for auth routes (TDD: tests first)
 * - POST /api/auth/login returns user.mustChangePassword in response
 * - PATCH /api/auth/password requires auth (401 without token)
 * - PATCH /api/auth/password with token and newPassword returns 200
 */
import request from 'supertest'
import app from '../app'
import * as authService from '../services/auth.service'

jest.mock('../services/auth.service')

const mockedAuthService = authService as jest.Mocked<typeof authService>

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns user.mustChangePassword when login succeeds with temp password user', async () => {
    mockedAuthService.login.mockResolvedValue({
      user: {
        id: 'u1',
        email: 'dean@test.edu',
        role: 'admin',
        firstName: 'Dean',
        lastName: 'User',
        facultyRank: undefined,
        department: 'CS',
        mustChangePassword: true,
      },
      token: 'jwt-token-here',
    } as Awaited<ReturnType<typeof authService.login>>)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dean@test.edu', password: 'temp123' })

    expect(res.status).toBe(200)
    expect(res.body.user).toBeDefined()
    expect(res.body.user.mustChangePassword).toBe(true)
    expect(res.body.token).toBeDefined()
  })

  it('returns 400 when email or password missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com' })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/required/i)
  })
})

describe('PATCH /api/auth/password', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when no Authorization header', async () => {
    const res = await request(app)
      .patch('/api/auth/password')
      .send({ newPassword: 'newPass123', confirmPassword: 'newPass123' })

    expect(res.status).toBe(401)
    expect(mockedAuthService.changePassword).not.toHaveBeenCalled()
  })

  it('returns 200 and success when authenticated and newPassword provided (forced change)', async () => {
    const jwt = require('jsonwebtoken')
    const token = jwt.sign(
      { id: 'user1', email: 'u@test.edu', role: 'faculty' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    )
    mockedAuthService.changePassword.mockResolvedValue({ success: true })

    const res = await request(app)
      .patch('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword: 'newSecure123' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(mockedAuthService.changePassword).toHaveBeenCalledWith('user1', { newPassword: 'newSecure123' })
  })
})

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({})
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/email/i)
    expect(mockedAuthService.forgotPassword).not.toHaveBeenCalled()
  })

  it('returns 200 with generic message when email provided', async () => {
    mockedAuthService.forgotPassword.mockResolvedValue(undefined)
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'user@example.com' })
    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/if an account exists/i)
    expect(mockedAuthService.forgotPassword).toHaveBeenCalledWith('user@example.com')
  })
})

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 when token or newPassword missing', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'abc123' })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/required/i)
    expect(mockedAuthService.resetPassword).not.toHaveBeenCalled()
  })

  it('returns 200 when valid token and newPassword', async () => {
    mockedAuthService.resetPassword.mockResolvedValue(undefined)
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'valid-token-here', newPassword: 'newSecure123' })
    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/reset/i)
    expect(mockedAuthService.resetPassword).toHaveBeenCalledWith('valid-token-here', 'newSecure123')
  })

  it('returns 400 when invalid or expired token', async () => {
    const { AppError } = require('../middleware/error.middleware')
    mockedAuthService.resetPassword.mockRejectedValue(new AppError('Invalid or expired reset token', 400))
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'bad-token', newPassword: 'newSecure123' })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/invalid|expired/i)
  })
})

describe('PATCH /api/auth/profile', () => {
  const jwt = require('jsonwebtoken')

  function token(overrides?: { id?: string; role?: string }) {
    return jwt.sign(
      { id: overrides?.id ?? 'user1', email: 'u@test.edu', role: overrides?.role ?? 'faculty' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when no Authorization header', async () => {
    const res = await request(app)
      .patch('/api/auth/profile')
      .send({ firstName: 'Jane', lastName: 'Doe' })
    expect(res.status).toBe(401)
    expect(mockedAuthService.updateProfile).not.toHaveBeenCalled()
  })

  it('returns 200 and updated user when authenticated and valid body', async () => {
    mockedAuthService.updateProfile.mockResolvedValue({
      id: 'user1',
      email: 'u@test.edu',
      role: 'faculty',
      firstName: 'Jane',
      lastName: 'Doe',
      facultyRank: 'Professor',
      department: 'Computer Science',
      isActive: true,
      mustChangePassword: false,
    } as Awaited<ReturnType<typeof authService.updateProfile>>)

    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${token()}`)
      .send({ firstName: 'Jane', lastName: 'Doe' })

    expect(res.status).toBe(200)
    expect(res.body.firstName).toBe('Jane')
    expect(res.body.lastName).toBe('Doe')
    expect(mockedAuthService.updateProfile).toHaveBeenCalledWith(
      'user1',
      expect.objectContaining({ firstName: 'Jane', lastName: 'Doe' })
    )
  })
})
