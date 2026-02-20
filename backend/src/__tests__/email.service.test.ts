/**
 * Unit tests for email.service
 * - When SMTP not configured: sendWelcome/sendResetPassword return without throwing (no-op)
 * - When transport mocked: sendMail is called with expected options
 */
import * as emailService from '../services/email.service'
import nodemailer from 'nodemailer'

jest.mock('nodemailer')

const originalEnv = process.env

describe('email.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    delete process.env.SMTP_HOST
    delete process.env.SMTP_USER
    delete process.env.SMTP_PASS
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('when SMTP not configured', () => {
    it('sendWelcome returns without throwing', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
      await emailService.sendWelcome('user@test.edu', {
        firstName: 'Test',
        loginUrl: 'http://localhost:3000/login',
      })
      expect(warnSpy).toHaveBeenCalledWith('Email not sent (SMTP not configured): welcome to', 'user@test.edu')
      warnSpy.mockRestore()
    })

    it('sendResetPassword returns without throwing', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
      await emailService.sendResetPassword('user@test.edu', {
        resetLink: 'http://localhost:3000/reset-password?token=abc',
        expiresIn: '1 hour',
      })
      expect(warnSpy).toHaveBeenCalledWith('Email not sent (SMTP not configured): reset password to', 'user@test.edu')
      warnSpy.mockRestore()
    })
  })

  describe('when transport is configured (mocked)', () => {
    const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' })

    beforeEach(() => {
      process.env.SMTP_HOST = 'smtp.test.com'
      process.env.SMTP_USER = 'user'
      process.env.SMTP_PASS = 'pass'
      ;(nodemailer.createTransport as jest.Mock).mockReturnValue({
        sendMail: mockSendMail,
      })
    })

    it('sendWelcome calls sendMail with subject and to', async () => {
      await emailService.sendWelcome('newuser@test.edu', {
        firstName: 'New',
        lastName: 'User',
        loginUrl: 'http://localhost:3000/login',
      })
      expect(mockSendMail).toHaveBeenCalledTimes(1)
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'newuser@test.edu',
          subject: expect.stringContaining('Welcome'),
          html: expect.any(String),
        })
      )
    })

    it('sendResetPassword calls sendMail with subject and reset link in html', async () => {
      await emailService.sendResetPassword('user@test.edu', {
        resetLink: 'http://localhost:3000/reset-password?token=xyz',
        expiresIn: '1 hour',
      })
      expect(mockSendMail).toHaveBeenCalledTimes(1)
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.edu',
          subject: expect.stringContaining('Reset'),
          html: expect.stringContaining('http://localhost:3000/reset-password?token=xyz'),
        })
      )
    })
  })
})
