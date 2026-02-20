/**
 * Unit tests for auth.service (TDD: tests first)
 * - login returns user.mustChangePassword when user has it
 * - changePassword: forced change (no currentPassword) clears flag
 * - changePassword: voluntary change requires currentPassword
 * - forgotPassword: no-op when user not found; sets token and sends email when found
 * - resetPassword: throws for invalid token/short password; updates password when valid
 */
import bcrypt from 'bcryptjs'
import { login, register, changePassword, forgotPassword, resetPassword } from '../services/auth.service'
import User from '../models/User'
import { AppError } from '../middleware/error.middleware'
import * as emailService from '../services/email.service'

jest.mock('../models/User')
jest.mock('../services/email.service')

const mockedUser = User as jest.Mocked<typeof User>
const mockedEmailService = emailService as jest.Mocked<typeof emailService>

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('returns user.mustChangePassword true when user has mustChangePassword', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10)
      const mockUser = {
        _id: 'user1',
        email: 'dean@test.edu',
        password: hashedPassword,
        firstName: 'Dean',
        lastName: 'User',
        role: 'admin' as const,
        department: 'CS',
        isActive: true,
        mustChangePassword: true,
      }
      mockedUser.findOne = jest.fn().mockResolvedValue(mockUser)

      const result = await login({ email: 'dean@test.edu', password: 'password123' })

      expect(result.user.mustChangePassword).toBe(true)
      expect(result.user.email).toBe('dean@test.edu')
      expect(result.token).toBeDefined()
    })

    it('returns user.mustChangePassword false when user has changed password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10)
      const mockUser = {
        _id: 'user2',
        email: 'faculty@test.edu',
        password: hashedPassword,
        firstName: 'Faculty',
        lastName: 'User',
        role: 'faculty' as const,
        department: 'CS',
        isActive: true,
        mustChangePassword: false,
      }
      mockedUser.findOne = jest.fn().mockResolvedValue(mockUser)

      const result = await login({ email: 'faculty@test.edu', password: 'password123' })

      expect(result.user.mustChangePassword).toBe(false)
    })
  })

  describe('changePassword', () => {
    it('allows forced change with only newPassword (mustChangePassword true)', async () => {
      const hashedOld = await bcrypt.hash('oldTemp', 10)
      const mockUser = {
        _id: 'user1',
        email: 'u@test.edu',
        password: hashedOld,
        mustChangePassword: true,
        save: jest.fn().mockResolvedValue(undefined),
      }
      mockedUser.findById = jest.fn().mockResolvedValue(mockUser)

      const result = await changePassword('user1', { newPassword: 'newSecure123' })

      expect(result.success).toBe(true)
      expect(mockUser.mustChangePassword).toBe(false)
      expect(mockUser.save).toHaveBeenCalled()
    })

    it('requires currentPassword when mustChangePassword is false', async () => {
      const mockUser = {
        _id: 'user2',
        email: 'u2@test.edu',
        password: 'hashed',
        mustChangePassword: false,
        save: jest.fn(),
      }
      mockedUser.findById = jest.fn().mockResolvedValue(mockUser)

      await expect(
        changePassword('user2', { newPassword: 'newPass123' })
      ).rejects.toThrow(AppError)

      expect(mockUser.save).not.toHaveBeenCalled()
    })

    it('rejects wrong currentPassword when changing voluntarily', async () => {
      const hashedOld = await bcrypt.hash('correctOld', 10)
      const mockUser = {
        _id: 'user3',
        email: 'u3@test.edu',
        password: hashedOld,
        mustChangePassword: false,
        save: jest.fn(),
      }
      mockedUser.findById = jest.fn().mockResolvedValue(mockUser)

      await expect(
        changePassword('user3', { currentPassword: 'wrongOld', newPassword: 'newPass123' })
      ).rejects.toThrow(/Current password is incorrect/)
    })

    it('rejects newPassword shorter than 6 characters', async () => {
      const mockUser = {
        _id: 'user4',
        mustChangePassword: true,
        save: jest.fn(),
      }
      mockedUser.findById = jest.fn().mockResolvedValue(mockUser)

      await expect(
        changePassword('user4', { newPassword: 'short' })
      ).rejects.toThrow(/at least 6 characters/)
    })
  })

  describe('forgotPassword', () => {
    it('returns without error when user not found', async () => {
      const chain = { select: jest.fn().mockResolvedValue(null) }
      mockedUser.findOne = jest.fn().mockReturnValue(chain)

      await forgotPassword('nobody@test.edu')

      expect(mockedUser.findOne).toHaveBeenCalledWith({ email: 'nobody@test.edu' })
      expect(chain.select).toHaveBeenCalledWith('+passwordResetToken +passwordResetExpires')
      expect(mockedEmailService.sendResetPassword).not.toHaveBeenCalled()
    })

    it('sets token/expiry and sends email when user found', async () => {
      const mockUser = {
        _id: 'u1',
        email: 'user@test.edu',
        passwordResetToken: undefined as string | undefined,
        passwordResetExpires: undefined as Date | undefined,
        save: jest.fn().mockResolvedValue(undefined),
      }
      const chain = { select: jest.fn().mockResolvedValue(mockUser) }
      mockedUser.findOne = jest.fn().mockReturnValue(chain)
      mockedEmailService.sendResetPassword.mockResolvedValue(undefined)

      await forgotPassword('user@test.edu')

      expect(mockUser.passwordResetToken).toBeDefined()
      expect(mockUser.passwordResetExpires).toBeInstanceOf(Date)
      expect(mockUser.save).toHaveBeenCalled()
      expect(mockedEmailService.sendResetPassword).toHaveBeenCalledWith(
        'user@test.edu',
        expect.objectContaining({ expiresIn: '1 hour' })
      )
    })
  })

  describe('resetPassword', () => {
    it('throws when token or newPassword missing', async () => {
      await expect(resetPassword('', 'newPass123')).rejects.toThrow(AppError)
      await expect(resetPassword('token', '')).rejects.toThrow(AppError)
    })

    it('throws when newPassword shorter than 6', async () => {
      await expect(resetPassword('valid-token', 'short')).rejects.toThrow(/min 6 characters/)
    })

    it('throws when invalid or expired token', async () => {
      const chain = { select: jest.fn().mockResolvedValue(null) }
      mockedUser.findOne = jest.fn().mockReturnValue(chain)

      await expect(resetPassword('invalid-token', 'newSecure123')).rejects.toThrow(/Invalid or expired reset token/)
    })

    it('updates password and clears token when valid', async () => {
      const mockUser = {
        _id: 'u1',
        password: 'old-hash',
        passwordResetToken: 'hashed-token',
        passwordResetExpires: new Date(Date.now() + 3600000),
        mustChangePassword: true,
        save: jest.fn().mockResolvedValue(undefined),
      }
      const chain = { select: jest.fn().mockResolvedValue(mockUser) }
      mockedUser.findOne = jest.fn().mockReturnValue(chain)

      await resetPassword('raw-token-here', 'newSecure123')

      expect(mockUser.password).not.toBe('old-hash')
      expect(mockUser.passwordResetToken).toBeUndefined()
      expect(mockUser.passwordResetExpires).toBeUndefined()
      expect(mockUser.mustChangePassword).toBe(false)
      expect(mockUser.save).toHaveBeenCalled()
    })
  })
})
