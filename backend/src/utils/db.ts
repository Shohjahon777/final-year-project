import mongoose from 'mongoose'

function getMongoDbUri(): string {
  const uri = process.env.MONGODB_URI
  if (uri) return uri
  if (process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI is required in production. Set it in your .env file.')
  }
  return 'mongodb+srv://root:SuzKWORcSitgd9Ai@university-app.fcik3wd.mongodb.net/?appName=university-app'
}

export const connectDB = async (): Promise<void> => {
  const uri = getMongoDbUri()
  try {
    const conn = await mongoose.connect(uri)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

export default connectDB
