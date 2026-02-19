import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'

/**
 * Validation middleware
 * Checks for validation errors and returns them in a consistent format
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: 'field' in err ? err.field : err.type,
        message: err.msg,
        value: 'value' in err ? err.value : undefined,
      })),
    })
  }

  next()
}
