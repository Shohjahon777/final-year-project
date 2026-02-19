import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'

export async function uploadController(req: AuthRequest, res: Response) {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }
  const url = `/uploads/${req.file.filename}`
  res.status(200).json({ url })
}
