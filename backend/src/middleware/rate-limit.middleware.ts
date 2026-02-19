import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { redisClient } from '../utils/redis'

// Check if Redis is connected
const useRedis = redisClient.isOpen

/**
 * General API rate limiter
 * Limit: 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  ...(useRedis && {
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:general:',
    }),
  }),
})

/**
 * Strict limiter for authentication endpoints
 * Limit: 5 requests per 15 minutes
 * Skips successful requests (only counts failures)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed login attempts
  ...(useRedis && {
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:auth:',
    }),
  }),
})

/**
 * Moderate limiter for file uploads
 * Limit: 20 uploads per 15 minutes
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  ...(useRedis && {
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:upload:',
    }),
  }),
})

/**
 * Strict limiter for forgot password
 * Limit: 3 requests per hour
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many password reset requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  ...(useRedis && {
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:forgot:',
    }),
  }),
})
