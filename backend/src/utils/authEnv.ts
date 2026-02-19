/**
 * JWT secret for signing/verifying tokens.
 * In production, JWT_SECRET must be set in .env (no fallback).
 * In development/test, falls back to a default for local runs.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.trim() === '') {
      throw new Error('JWT_SECRET is required in production. Set it in your .env file.')
    }
    return secret
  }
  return secret || 'your-secret-key'
}
