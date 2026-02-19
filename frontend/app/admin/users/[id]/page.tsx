'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { adminApi, FacultyDetail, AdminSubmission } from '@/lib/api/admin'
import {
  ChevronLeft,
  Mail,
  Building2,
  Award,
  FileText,
  AlertTriangle,
  Calendar,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  BookOpen,
  Users,
  Briefcase,
  HeartHandshake,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const outcomeConfig = {
  outstanding: {
    label: 'Outstanding',
    color: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-200 dark:border-green-800'
  },
  satisfactory: {
    label: 'Satisfactory',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-800'
  },
  improvement_plan: {
    label: 'Improvement',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-200 dark:border-amber-800'
  },
  contract_risk: {
    label: 'At Risk',
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-800'
  },
}

const categoryIcons = {
  research: { icon: BookOpen, label: 'Research', color: 'text-purple-600 dark:text-purple-400' },
  teaching: { icon: Users, label: 'Teaching', color: 'text-blue-600 dark:text-blue-400' },
  admin: { icon: Briefcase, label: 'Admin', color: 'text-orange-600 dark:text-orange-400' },
  outreach: { icon: HeartHandshake, label: 'Outreach', color: 'text-green-600 dark:text-green-400' },
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function AdminUserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === 'string' ? params.id : ''
  const [detail, setDetail] = useState<FacultyDetail | null>(null)
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (!id) {
      setError('Invalid user ID')
      setLoading(false)
      return
    }

    // Fetch both profile and submissions
    Promise.all([
      adminApi.getFacultyById(id),
      adminApi.getSubmissions({ userId: id, limit: 100 })
    ])
      .then(([profileData, submissionsData]) => {
        setDetail(profileData)
        setSubmissions(submissionsData.submissions)
      })
      .catch(() => setError('Faculty not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
          <p className="mt-3 text-xs text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Users
          </Button>
        </Link>
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-6 text-center text-red-700 dark:text-red-300">
          {error ?? 'Faculty not found'}
        </div>
      </div>
    )
  }

  const { user, scores, submissionCounts, penalties } = detail
  const currentScore = scores[0] // Most recent score
  const outcome = currentScore?.outcome
  const outcomeInfo = outcome ? outcomeConfig[outcome as keyof typeof outcomeConfig] : null

  const totalPending = submissionCounts?.pending ?? 0
  const totalApproved = submissionCounts?.approved ?? 0
  const totalRejected = submissionCounts?.rejected ?? 0
  const totalSubmissions = totalPending + totalApproved + totalRejected

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getSubmissionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return submissions.filter(s => {
      const subDate = new Date(s.submittedAt).toISOString().split('T')[0]
      return subDate === dateStr
    })
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1))
  }

  const categoryColors = {
    research: 'bg-purple-500',
    teaching: 'bg-blue-500',
    admin: 'bg-orange-500',
    outreach: 'bg-green-500',
  }

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 h-8">
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="text-xs">Back</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
          <Link href="/admin" className="hover:text-gray-700 dark:hover:text-gray-300">Admin</Link>
          <span>/</span>
          <Link href="/admin/users" className="hover:text-gray-700 dark:hover:text-gray-300">Users</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-50 font-medium">Profile</span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* LEFT SIDEBAR - Profile Card */}
        <div className="lg:col-span-1 space-y-3">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            {/* Large Avatar */}
            <div className="flex justify-center mb-4">
              <div className={cn(
                'h-24 w-24 rounded-full flex items-center justify-center font-bold text-2xl',
                outcomeInfo ? `${outcomeInfo.bg} ${outcomeInfo.color}` : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              )}>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
            </div>

            {/* Name & Outcome */}
            <div className="text-center mb-4">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>

              {/* Score Badge */}
              {currentScore && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className={cn(
                    'px-3 py-1.5 rounded-lg border',
                    outcomeInfo?.bg, outcomeInfo?.border
                  )}>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-2xl font-bold', outcomeInfo?.color)}>
                        {currentScore.finalScore}
                      </span>
                      <span className={cn('text-[10px] font-medium uppercase', outcomeInfo?.color)}>
                        pts
                      </span>
                    </div>
                    <p className={cn('text-[10px] font-medium uppercase tracking-wide mt-0.5', outcomeInfo?.color)}>
                      {outcomeInfo?.label}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 rounded bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50">
                <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{totalPending}</p>
                <p className="text-[9px] text-gray-600 dark:text-gray-400 uppercase">Pending</p>
              </div>
              <div className="text-center p-2 rounded bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/50">
                <p className="text-lg font-bold text-green-700 dark:text-green-400">{totalApproved}</p>
                <p className="text-[9px] text-gray-600 dark:text-gray-400 uppercase">Approved</p>
              </div>
              <div className="text-center p-2 rounded bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50">
                <p className="text-lg font-bold text-red-700 dark:text-red-400">{totalRejected}</p>
                <p className="text-[9px] text-gray-600 dark:text-gray-400 uppercase">Rejected</p>
              </div>
            </div>

            {/* View Submissions Button */}
            <Link href={`/admin/submissions?userId=${id}`}>
              <Button size="sm" className="w-full" variant="outline">
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">View All Submissions</span>
              </Button>
            </Link>
          </div>

          {/* Category Breakdown */}
          {currentScore && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Category Scores
              </h3>
              <div className="space-y-3">
                {Object.entries(categoryIcons).map(([key, config]) => {
                  const Icon = config.icon
                  const score = currentScore[key as keyof typeof currentScore] as number || 0
                  const percentage = Math.min(100, (score / 40) * 100) // Assuming max 40 per category

                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <Icon className={cn('h-3.5 w-3.5', config.color)} />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {config.label}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-50">
                          {score}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
              Information
            </h3>
            <div className="space-y-2.5">
              {user.department && (
                <div className="flex items-start gap-2">
                  <Building2 className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Department</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-50">{user.department}</p>
                  </div>
                </div>
              )}
              {user.facultyRank && (
                <div className="flex items-start gap-2">
                  <Award className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Rank</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-50">{user.facultyRank}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Mail className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-gray-500 uppercase">Email</p>
                  <a href={`mailto:${user.email}`} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block">
                    {user.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Activity & Details */}
        <div className="lg:col-span-2 space-y-3">
          {/* Academic Year Scores */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance History
              </h2>
            </div>
            {scores.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No score records yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {scores.map((s) => {
                  const config = outcomeConfig[s.outcome as keyof typeof outcomeConfig]
                  return (
                    <div
                      key={s.academicYear}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                            {s.academicYear}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            R: {s.research} • T: {s.teaching} • A: {s.admin} • O: {s.outreach}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xl font-bold', config?.color)}>
                          {s.finalScore}
                        </span>
                        <span className={cn(
                          'px-2 py-1 rounded text-[10px] font-medium uppercase',
                          config?.bg, config?.color
                        )}>
                          {config?.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Submission Calendar */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Submission Calendar
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => changeMonth(-1)}
                  className="h-7 w-7 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[100px] text-center">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => changeMonth(1)}
                  className="h-7 w-7 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-medium text-gray-500 uppercase py-1">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Calendar Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const date = new Date(year, month, day)
                const daySubmissions = getSubmissionsForDate(date)
                const isToday = new Date().toDateString() === date.toDateString()

                return (
                  <div
                    key={day}
                    className={cn(
                      'aspect-square rounded-lg border p-1 hover:border-gray-400 dark:hover:border-gray-600 transition-all cursor-pointer relative',
                      isToday ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-800',
                      daySubmissions.length > 0 && 'bg-gray-50 dark:bg-gray-900/50'
                    )}
                    title={daySubmissions.length > 0 ? `${daySubmissions.length} submission(s)` : ''}
                  >
                    <div className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                      {day}
                    </div>

                    {/* Submission indicators */}
                    {daySubmissions.length > 0 && (
                      <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 flex-wrap">
                        {daySubmissions.slice(0, 3).map((sub, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              'h-1 flex-1 rounded-full',
                              categoryColors[sub.category as keyof typeof categoryColors]
                            )}
                            title={sub.title}
                          />
                        ))}
                        {daySubmissions.length > 3 && (
                          <div className="text-[8px] text-gray-500 font-bold">
                            +{daySubmissions.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex flex-wrap gap-3 text-[10px]">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-gray-600 dark:text-gray-400">Research</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">Teaching</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  <span className="text-gray-600 dark:text-gray-400">Admin</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">Outreach</span>
                </div>
              </div>
            </div>
          </div>

          {/* Penalties Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Penalties
              </h2>
              {penalties.length > 0 && (
                <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-[10px] font-bold text-red-700 dark:text-red-400">
                  {penalties.length} total
                </span>
              )}
            </div>
            {penalties.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-10 w-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No penalties on record</p>
              </div>
            ) : (
              <div className="space-y-2">
                {penalties.map((p) => (
                  <div
                    key={p._id}
                    className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-50 flex-1">
                        {p.description}
                      </p>
                      <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-xs font-bold text-red-700 dark:text-red-400 flex-shrink-0">
                        {p.points} pts
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize">
                        {p.type.replace('_', ' ')}
                      </span>
                      <span>•</span>
                      <span>{formatDate(p.appliedAt)}</span>
                      <span>•</span>
                      <span>by {p.appliedBy.firstName} {p.appliedBy.lastName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
