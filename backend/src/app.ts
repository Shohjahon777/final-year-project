import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './utils/db'
import { errorHandler } from './middleware/error.middleware'
import authRoutes from './routes/auth.routes'
import facultyRoutes from './routes/faculty.routes'
import adminRoutes from './routes/admin.routes'
import configRoutes from './routes/config.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Faculty Evaluation API is running' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/faculty', facultyRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/config', configRoutes)

// Error handling middleware (must be last)
app.use(errorHandler)

// Connect to database and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
      console.log(`📡 API available at http://localhost:${PORT}/api`)
    })
  })
  .catch((error) => {
    console.error('❌ Failed to connect to database:', error)
    process.exit(1)
  })

export default app
