'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Activity,
} from 'lucide-react'
import { adminApi, AdminDashboardData } from '@/lib/api/admin'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

// Mock data for development
const mockDashboardData: AdminDashboardData = {
  stats: {
    totalFaculty: 45,
    pendingSubmissions: 12,
    averageScore: 67.5,
    atRiskCount: 3,
  },
  outcomeDistribution: {
    outstanding: 8,
    satisfactory: 28,
    improvement_plan: 6,
    contract_risk: 3,
  },
  recentSubmissions: [
    {
      _id: '1',
      title: 'Q1 Journal Publication - Nature',
      category: 'research',
      status: 'pending',
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      calculatedPoints: 14,
      userId: { _id: 'u1', firstName: 'John', lastName: 'Doe', email: 'john.doe@cau.edu' },
    },
    {
      _id: '2',
      title: 'Course Material Update - CS101',
      category: 'teaching',
      status: 'pending',
      submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      calculatedPoints: 3,
      userId: { _id: 'u2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@cau.edu' },
    },
    {
      _id: '3',
      title: 'Department Committee Work',
      category: 'admin',
      status: 'pending',
      submittedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      calculatedPoints: 4,
      userId: { _id: 'u3', firstName: 'Robert', lastName: 'Johnson', email: 'robert.j@cau.edu' },
    },
    {
      _id: '4',
      title: 'Conference Presentation - IEEE',
      category: 'research',
      status: 'approved',
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      calculatedPoints: 6,
      userId: { _id: 'u4', firstName: 'Emily', lastName: 'Brown', email: 'emily.b@cau.edu' },
    },
    {
      _id: '5',
      title: 'Community Workshop',
      category: 'outreach',
      status: 'rejected',
      submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      calculatedPoints: 2,
      userId: { _id: 'u5', firstName: 'Michael', lastName: 'Davis', email: 'michael.d@cau.edu' },
    },
  ],
  recentPenalties: [
    {
      _id: 'p1',
      type: 'meeting',
      description: 'Missed department meeting on March 15',
      points: -2,
      appliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      userId: { _id: 'u3', firstName: 'Robert', lastName: 'Johnson' },
      appliedBy: { _id: 'a1', firstName: 'Admin', lastName: 'User' },
    },
    {
      _id: 'p2',
      type: 'deadline',
      description: 'Late submission of annual report',
      points: -3,
      appliedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      userId: { _id: 'u5', firstName: 'Michael', lastName: 'Davis' },
      appliedBy: { _id: 'a1', firstName: 'Admin', lastName: 'User' },
    },
  ],
  academicYear: '2024-2025',
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

const categoryColors: Record<string, string> = {
  research: 'bg-chart-research/10 text-chart-research',
  teaching: 'bg-chart-teaching/10 text-chart-teaching',
  admin: 'bg-chart-admin/10 text-chart-admin',
  outreach: 'bg-chart-outreach/10 text-chart-outreach',
}

const statusColors: Record<string, string> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { error: showError } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await adminApi.getDashboard()
        setData(dashboardData)
      } catch (err) {
        console.error('Failed to fetch admin dashboard:', err)
        showError('Dashboard Error', 'Failed to load dashboard data. Please refresh.')
        // Still set mock data as fallback for development
        setData(mockDashboardData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [showError])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const dashboard = data || mockDashboardData

  return (
    <div className="space-y-4">
      {/* Compact Page Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Dashboard</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {dashboard.academicYear} • Faculty Performance Overview
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => router.push('/admin/reports')}>
          <Activity className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs">Reports</span>
        </Button>
      </div>

      {/* Compact Stats Grid - Professional Minimal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Faculty - Gray */}
        <div className="group relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Faculty</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">
                {dashboard.stats.totalFaculty}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/users')}
            className="mt-3 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
          >
            View users <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Pending Reviews - Highlighted with amber accent */}
        <div className="group relative bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/50 p-4 hover:shadow-md transition-all duration-200 hover:border-amber-300 dark:hover:border-amber-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">Pending</p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-300 mt-1">
                {dashboard.stats.pendingSubmissions}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/submissions?status=pending')}
            className="mt-3 text-xs text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 flex items-center gap-1 transition-colors font-medium"
          >
            Review now <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Average Score - Gray */}
        <div className="group relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">
                {dashboard.stats.averageScore.toFixed(1)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">/ 100 points max</p>
        </div>

        {/* At Risk - Red accent for critical metric */}
        <div className="group relative bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/50 p-4 hover:shadow-md transition-all duration-200 hover:border-red-300 dark:hover:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wide">At Risk</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-300 mt-1">
                {dashboard.stats.atRiskCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="mt-3 text-xs text-red-700 dark:text-red-400 font-medium">Need intervention</p>
        </div>
      </div>

      {/* Outcome Distribution - Clean Minimal */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Performance Distribution</CardTitle>
              <CardDescription className="text-xs mt-0.5">Faculty categories • {dashboard.academicYear}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Outstanding */}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Outstanding
                </p>
                <div className="h-5 w-5 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {dashboard.outcomeDistribution.outstanding || 0}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">80+ points</p>
            </div>

            {/* Satisfactory */}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Satisfactory
                </p>
                <div className="h-5 w-5 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {dashboard.outcomeDistribution.satisfactory || 0}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">60-79 points</p>
            </div>

            {/* Improvement Plan */}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Improvement
                </p>
                <div className="h-5 w-5 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {dashboard.outcomeDistribution.improvement_plan || 0}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">40-59 points</p>
            </div>

            {/* Contract Risk */}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  At Risk
                </p>
                <div className="h-5 w-5 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {dashboard.outcomeDistribution.contract_risk || 0}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">&lt;40 points</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout - Compact & Clean */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Recent Submissions - Compact List */}
        <div className="lg:col-span-2">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Recent Submissions</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Latest activity requiring review</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/admin/submissions')} className="h-7 text-xs">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {dashboard.recentSubmissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                    <FileText className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-xs">No submissions found</p>
                  </div>
                ) : (
                  dashboard.recentSubmissions.map((submission) => (
                    <div
                      key={submission._id}
                      className="group flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer"
                      onClick={() => router.push(`/admin/submissions?id=${submission._id}`)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Category Badge - Minimal */}
                        <div className="flex-shrink-0 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                          {submission.category}
                        </div>

                        {/* Title & User */}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-50 truncate">
                            {submission.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {submission.userId.firstName} {submission.userId.lastName} • {formatTimeAgo(submission.submittedAt)}
                          </p>
                        </div>
                      </div>

                      {/* Points & Status */}
                      <div className="flex items-center gap-2.5 flex-shrink-0 ml-3">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                          +{submission.calculatedPoints}
                        </span>
                        {submission.status === 'pending' && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                            <Clock className="h-3 w-3" />
                            <span className="text-[10px] font-medium uppercase">Pending</span>
                          </div>
                        )}
                        {submission.status === 'approved' && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            <CheckCircle className="h-3 w-3" />
                            <span className="text-[10px] font-medium uppercase">Approved</span>
                          </div>
                        )}
                        {submission.status === 'rejected' && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                            <XCircle className="h-3 w-3" />
                            <span className="text-[10px] font-medium uppercase">Rejected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Penalties - Compact List */}
        <div>
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Recent Penalties</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Applied recently</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/admin/penalties')} className="h-7 text-xs">
                  All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {dashboard.recentPenalties.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                    <AlertTriangle className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-xs">No recent penalties</p>
                  </div>
                ) : (
                  dashboard.recentPenalties.map((penalty) => (
                    <div
                      key={penalty._id}
                      className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 hover:border-red-300 dark:hover:border-red-800 transition-all"
                    >
                      {/* Header: Name + Points */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-red-900 dark:text-red-300">
                          {penalty.userId.firstName} {penalty.userId.lastName}
                        </span>
                        <span className="text-xs font-bold text-red-700 dark:text-red-400 px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30">
                          {penalty.points} pts
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-700 dark:text-gray-400 line-clamp-2 mb-1.5">
                        {penalty.description}
                      </p>

                      {/* Footer: Time + Admin */}
                      <p className="text-[10px] text-gray-500">
                        {formatTimeAgo(penalty.appliedAt)} • by {penalty.appliedBy.firstName} {penalty.appliedBy.lastName}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
