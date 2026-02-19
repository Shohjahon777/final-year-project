'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import apiClient from '@/lib/api/client'

export default function ChangePasswordPage() {
  const { user, loading: authLoading, updateUser } = useAuth()
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isForcedChange = user?.mustChangePassword === true

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (!isForcedChange) {
      router.replace(user?.role === 'admin' ? '/admin' : '/dashboard')
    }
  }, [user, authLoading, isForcedChange, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match')
      return
    }
    if (!isForcedChange && !currentPassword) {
      setError('Current password is required')
      return
    }

    setSubmitting(true)
    try {
      await apiClient.patch('/auth/password', {
        ...(isForcedChange ? {} : { currentPassword }),
        newPassword,
      })
      updateUser({ mustChangePassword: false })
      router.replace(user?.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!isForcedChange) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Set your password
          </CardTitle>
          <CardDescription className="text-center">
            Your account was created with a temporary password. Please choose a new password for security.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New password <span className="text-danger-500">*</span>
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm new password <span className="text-danger-500">*</span>
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                minLength={6}
                disabled={submitting}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Updating...' : 'Set password and continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
