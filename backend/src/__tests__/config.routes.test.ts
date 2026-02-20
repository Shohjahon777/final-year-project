/**
 * Integration tests for config routes
 * - GET routes require auth (any role); return 401 without token
 * - PUT /:key and POST /seed require admin; return 403 for faculty
 * - GET / returns 200 with config data
 */
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../app'
import * as configService from '../services/config.service'

jest.mock('../services/config.service')

const mockedConfigService = configService as jest.Mocked<typeof configService>

function facultyToken() {
  return jwt.sign(
    { id: 'fac1', email: 'fac@test.edu', role: 'faculty' },
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

describe('GET /api/config', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 without Authorization', async () => {
    const res = await request(app).get('/api/config')
    expect(res.status).toBe(401)
    expect(mockedConfigService.getAllConfigurations).not.toHaveBeenCalled()
  })

  it('returns 200 and config data when authenticated', async () => {
    mockedConfigService.getAllConfigurations.mockResolvedValue([
      { key: 'research.journal.points', value: '10' },
    ] as unknown as Awaited<ReturnType<typeof configService.getAllConfigurations>>)

    const res = await request(app)
      .get('/api/config')
      .set('Authorization', `Bearer ${facultyToken()}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(mockedConfigService.getAllConfigurations).toHaveBeenCalled()
  })
})

describe('GET /api/config/multipliers', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 200 and multipliers when authenticated', async () => {
    mockedConfigService.getMultipliers.mockResolvedValue({ research: 1, teaching: 1 } as Awaited<ReturnType<typeof configService.getMultipliers>>)

    const res = await request(app)
      .get('/api/config/multipliers')
      .set('Authorization', `Bearer ${facultyToken()}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(mockedConfigService.getMultipliers).toHaveBeenCalled()
  })
})

describe('GET /api/config/ceilings', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 200 and ceilings when authenticated', async () => {
    mockedConfigService.getCeilings.mockResolvedValue({ research: 100 } as Awaited<ReturnType<typeof configService.getCeilings>>)

    const res = await request(app)
      .get('/api/config/ceilings')
      .set('Authorization', `Bearer ${facultyToken()}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(mockedConfigService.getCeilings).toHaveBeenCalled()
  })
})

describe('GET /api/config/category/:category', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 200 and configs by category when authenticated', async () => {
    mockedConfigService.getConfigurationsByCategory.mockResolvedValue([
      { key: 'research.journal.points', value: '10' },
    ] as Awaited<ReturnType<typeof configService.getConfigurationsByCategory>>)

    const res = await request(app)
      .get('/api/config/category/research')
      .set('Authorization', `Bearer ${facultyToken()}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(mockedConfigService.getConfigurationsByCategory).toHaveBeenCalledWith('research')
  })
})

describe('GET /api/config/key/:key', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 200 and config by key when authenticated', async () => {
    mockedConfigService.getConfigurationByKey.mockResolvedValue({ key: 'research.journal.points', value: '10' } as Awaited<ReturnType<typeof configService.getConfigurationByKey>>)

    const res = await request(app)
      .get('/api/config/key/research.journal.points')
      .set('Authorization', `Bearer ${facultyToken()}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(mockedConfigService.getConfigurationByKey).toHaveBeenCalledWith('research.journal.points')
  })
})

describe('PUT /api/config/:key (admin only)', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 403 when faculty', async () => {
    const res = await request(app)
      .put('/api/config/research.journal.points')
      .set('Authorization', `Bearer ${facultyToken()}`)
      .send({ value: '15' })
    expect(res.status).toBe(403)
    expect(mockedConfigService.updateConfiguration).not.toHaveBeenCalled()
  })

  it('returns 200 when admin updates config', async () => {
    mockedConfigService.updateConfiguration.mockResolvedValue({ key: 'research.journal.points', value: '15' } as Awaited<ReturnType<typeof configService.updateConfiguration>>)

    const res = await request(app)
      .put('/api/config/research.journal.points')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ value: '15' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(mockedConfigService.updateConfiguration).toHaveBeenCalledWith('research.journal.points', '15', 'admin1')
  })
})

describe('POST /api/config/seed (admin only)', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 403 when faculty', async () => {
    const res = await request(app)
      .post('/api/config/seed')
      .set('Authorization', `Bearer ${facultyToken()}`)
    expect(res.status).toBe(403)
    expect(mockedConfigService.seedDefaultConfigurations).not.toHaveBeenCalled()
  })

  it('returns 200 when admin seeds', async () => {
    mockedConfigService.seedDefaultConfigurations.mockResolvedValue({ message: 'Seeded' } as Awaited<ReturnType<typeof configService.seedDefaultConfigurations>>)

    const res = await request(app)
      .post('/api/config/seed')
      .set('Authorization', `Bearer ${adminToken()}`)

    expect(res.status).toBe(200)
    expect(mockedConfigService.seedDefaultConfigurations).toHaveBeenCalled()
  })
})
