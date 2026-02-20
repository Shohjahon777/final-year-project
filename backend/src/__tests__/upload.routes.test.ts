/**
 * Integration tests for upload route (TDD: tests first, then implement)
 * - POST /api/upload without auth returns 401
 * - POST /api/upload with auth and file returns 200 and body with url or path
 */
import request from 'supertest'
import app from '../app'
import jwt from 'jsonwebtoken'

describe('POST /api/upload', () => {
  it('returns 401 when no Authorization header', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from('test content'), 'test.txt')

    expect(res.status).toBe(401)
  })

  it('returns 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', 'Bearer invalid-token')
      .attach('file', Buffer.from('test content'), 'test.txt')

    expect(res.status).toBe(401)
  })

  it('returns 200 and body with url when authenticated and file uploaded', async () => {
    const token = jwt.sign(
      { id: 'user1', email: 'u@test.edu', role: 'faculty' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    )

    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('evidence content'), 'evidence.pdf')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('url')
    expect(typeof res.body.url).toBe('string')
    expect(res.body.url.length).toBeGreaterThan(0)
  })
})
