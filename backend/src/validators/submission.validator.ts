import { body, param } from 'express-validator'
import { validate } from '../middleware/validation.middleware'

/**
 * Validator for creating a new submission
 */
export const createSubmissionValidator = [
  body('category')
    .isIn(['research', 'teaching', 'admin', 'outreach'])
    .withMessage('Category must be one of: research, teaching, admin, outreach'),

  body('subcategory')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Subcategory must be between 3 and 100 characters')
    .matches(/^[a-z0-9_]+$/)
    .withMessage('Subcategory must contain only lowercase letters, numbers, and underscores'),

  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .escape(),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters')
    .escape(),

  body('evidence.type')
    .isIn(['link', 'file', 'text'])
    .withMessage('Evidence type must be one of: link, file, text'),

  body('evidence.value')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Evidence value must be between 1 and 1000 characters'),

  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),

  validate,
]

/**
 * Validator for updating a submission
 */
export const updateSubmissionValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid submission ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .escape(),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters')
    .escape(),

  body('evidence.type')
    .optional()
    .isIn(['link', 'file', 'text'])
    .withMessage('Evidence type must be one of: link, file, text'),

  body('evidence.value')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Evidence value must be between 1 and 1000 characters'),

  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),

  validate,
]

/**
 * Validator for submission ID parameter
 */
export const submissionIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid submission ID'),

  validate,
]
