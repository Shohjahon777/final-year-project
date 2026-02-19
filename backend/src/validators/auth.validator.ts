import { body } from 'express-validator'
import { validate } from '../middleware/validation.middleware'

/**
 * Validator for login
 */
export const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  validate,
]

/**
 * Validator for registration
 */
export const registerValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('First name can only contain letters, spaces, and hyphens')
    .escape(),

  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('Last name can only contain letters, spaces, and hyphens')
    .escape(),

  body('role')
    .isIn(['faculty', 'admin'])
    .withMessage('Role must be either faculty or admin'),

  body('facultyRank')
    .optional()
    .isIn(['Head', 'Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'])
    .withMessage('Invalid faculty rank'),

  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department must be between 2 and 100 characters')
    .escape(),

  validate,
]

/**
 * Validator for forgot password
 */
export const forgotPasswordValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  validate,
]

/**
 * Validator for reset password
 */
export const resetPasswordValidator = [
  body('token')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Reset token is required'),

  body('newPassword')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  validate,
]

/**
 * Validator for change password
 */
export const changePasswordValidator = [
  body('currentPassword')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Current password is required when not forced'),

  body('newPassword')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  validate,
]
