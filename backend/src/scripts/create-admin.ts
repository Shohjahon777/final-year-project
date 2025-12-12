import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import User from '../models/User'
import { connectDB } from '../utils/db'

dotenv.config()

async function createAdmin() {
  try {
    await connectDB()

    const email = process.env.ADMIN_EMAIL || 'admin@cau.edu'
    const password = process.env.ADMIN_PASSWORD || 'admin123'
    const firstName = process.env.ADMIN_FIRST_NAME || 'Admin'
    const lastName = process.env.ADMIN_LAST_NAME || 'User'

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: email.toLowerCase() })
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', email)
      await mongoose.disconnect()
      process.exit(0)
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create admin user
    const admin = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role: 'admin',
      department: 'Computer Science',
      isActive: true,
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('⚠️  Please change the password after first login!')
    console.log('')
    console.log('User ID:', admin._id.toString())

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  }
}

createAdmin()
