import { createClient } from 'redis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redisClient = createClient({
  url: redisUrl,
  password: process.env.REDIS_PASSWORD,
})

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err)
})

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully')
})

// Connect to Redis
export async function connectRedis() {
  try {
    await redisClient.connect()
  } catch (error) {
    console.error('Failed to connect to Redis:', error)
    console.log('⚠️  Running without Redis (rate limiting will use memory)')
  }
}

export default redisClient
