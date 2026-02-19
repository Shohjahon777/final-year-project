import express from 'express'
import path from 'path'
import fs from 'fs'
import multer from 'multer'
import { authenticate } from '../middleware/auth.middleware'
import { uploadLimiter } from '../middleware/rate-limit.middleware'
import { uploadController } from '../controllers/upload.controller'

const router = express.Router()

const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Allowed file types for security
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/zip',
]

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname) || ''
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    cb(null, `${uniqueSuffix}-${sanitized}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG, WEBP, ZIP'))
    }
  },
})

router.post('/', authenticate, uploadLimiter, upload.single('file'), uploadController)

export default router
