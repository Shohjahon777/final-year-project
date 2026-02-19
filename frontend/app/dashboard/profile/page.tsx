'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import apiClient from '@/lib/api/client'
import { User, Loader2 } from 'lucide-react'

const FACULTY_RANKS = ['Head', 'Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'] as const

function ProfileContent() {
  const { user, loading: authLoading, updateUser } = useAuth()
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [department, setDepartment] = useState('')
  const [facultyRank, setFacultyRank] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName ?? '')
    setLastName(user.lastName ?? '')
    setDepartment(user.department ?? '')
    setFacultyRank(user.facultyRank ?? '')
  }, [user])

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
    }
  }, [authLoading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)
    try {
      const payload: { firstName?: string; lastName?: string; department?: string; facultyRank?: string } = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        department: department.trim(),
      }
      if (user?.role === 'faculty' && facultyRank) payload.facultyRank = facultyRank
      const res = await apiClient.patch('/auth/profile', payload)
      updateUser(res.data)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight mb-1">
          Profile
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Update your profile information
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-14 w-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <User className="h-7 w-7 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-600 dark:text-green-400" role="status">
                Profile updated successfully.
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                  First name
                </label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                  Last name
                </label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="bg-white dark:bg-gray-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed.</p>
            </div>

            <div>
              <label htmlFor="department" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Department
              </label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="bg-white dark:bg-gray-900"
              />
            </div>

            {user.role === 'faculty' && (
              <div>
                <label htmlFor="facultyRank" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                  Rank
                </label>
                <select
                  id="facultyRank"
                  value={facultyRank}
                  onChange={(e) => setFacultyRank(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select rank</option>
                  {FACULTY_RANKS.map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save profile'
                )}
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => router.push('/change-password')}
            className="text-gray-700 dark:text-gray-300"
          >
            Change password
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}
