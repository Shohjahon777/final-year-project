import express from 'express'
import path from 'path'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { connectDB } from './utils/db'
import { connectRedis } from './utils/redis'
import { errorHandler } from './middleware/error.middleware'
import { generalLimiter } from './middleware/rate-limit.middleware'
import authRoutes from './routes/auth.routes'
import facultyRoutes from './routes/faculty.routes'
import adminRoutes from './routes/admin.routes'
import configRoutes from './routes/config.routes'
import uploadRoutes from './routes/upload.routes'
import vacationRoutes from './routes/vacation.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

// Security middleware - helmet (must be early)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow uploads from frontend
}))

// CORS middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting (applied globally to all API routes)
app.use('/api/', generalLimiter)

// Static files for uploaded assets
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Faculty Evaluation API is running' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/faculty', facultyRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/config', configRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/vacations', vacationRoutes)

// Error handling middleware (must be last)
app.use(errorHandler)

// Connect to database, Redis, and start server only when not in test
if (process.env.NODE_ENV !== 'test') {
  Promise.all([
    connectDB(),
    connectRedis().catch(err => {
      console.warn('⚠️  Redis connection failed, continuing without Redis:', err.message)
    })
  ])
    .then(() => {
      app.listen(PORT, () => {
        console.log('\n' + '='.repeat(60))
        console.log('🎓 Faculty Evaluation System API')
        console.log('='.repeat(60))

        if (process.env.NODE_ENV === 'production') {
          console.log(`🚀 Server listening on port ${PORT}`)
          if (process.env.API_PUBLIC_URL) {
            console.log(`📡 API: ${process.env.API_PUBLIC_URL}`)
          }
        } else {
          console.log(`🚀 Server: http://localhost:${PORT}`)
          console.log(`📡 API: http://localhost:${PORT}/api`)
          console.log(`❤️  Health: http://localhost:${PORT}/api/health`)
        }

        console.log(`🔒 Security: Helmet + Rate Limiting enabled`)
        console.log(`🌍 CORS: ${FRONTEND_URL}`)
        console.log('='.repeat(60) + '\n')
      })
    })
    .catch((error) => {
      console.error('❌ Failed to start server:', error)
      process.exit(1)
    })
}

export default app
