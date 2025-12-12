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
        // Use mock data if API fails
        setData(mockDashboardData)
        console.warn('Using mock data for admin dashboard')
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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Academic Year {dashboard.academicYear} • Overview of faculty performance and submissions
          </p>
        </div>
        <Button onClick={() => router.push('/admin/reports')}>
          <Activity className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Faculty</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-1">
                  {dashboard.stats.totalFaculty}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <Button
              variant="link"
              className="mt-4 p-0 h-auto text-sm"
              onClick={() => router.push('/admin/users')}
            >
              View all users <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pending Reviews
                </p>
                <p className="text-3xl font-bold text-warning-600 mt-1">
                  {dashboard.stats.pendingSubmissions}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
            <Button
              variant="link"
              className="mt-4 p-0 h-auto text-sm"
              onClick={() => router.push('/admin/submissions?status=pending')}
            >
              Review submissions <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-1">
                  {dashboard.stats.averageScore.toFixed(1)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">Out of 100 points maximum</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">At Risk</p>
                <p className="text-3xl font-bold text-danger-600 mt-1">
                  {dashboard.stats.atRiskCount}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-danger-600 dark:text-danger-400" />
              </div>
            </div>
            <p className="mt-4 text-sm text-danger-600">Require intervention</p>
          </CardContent>
        </Card>
      </div>

      {/* Outcome Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Outcome Distribution</CardTitle>
          <CardDescription>Faculty performance categories for {dashboard.academicYear}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
              <p className="text-sm font-medium text-success-700 dark:text-success-400">
                Outstanding
              </p>
              <p className="text-2xl font-bold text-success-600 mt-1">
                {dashboard.outcomeDistribution.outstanding || 0}
              </p>
              <p className="text-xs text-success-600/70 mt-1">80+ points</p>
            </div>
            <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
              <p className="text-sm font-medium text-primary-700 dark:text-primary-400">
                Satisfactory
              </p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {dashboard.outcomeDistribution.satisfactory || 0}
              </p>
              <p className="text-xs text-primary-600/70 mt-1">60-79 points</p>
            </div>
            <div className="p-4 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
              <p className="text-sm font-medium text-warning-700 dark:text-warning-400">
                Improvement Plan
              </p>
              <p className="text-2xl font-bold text-warning-600 mt-1">
                {dashboard.outcomeDistribution.improvement_plan || 0}
              </p>
              <p className="text-xs text-warning-600/70 mt-1">40-59 points</p>
            </div>
            <div className="p-4 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800">
              <p className="text-sm font-medium text-danger-700 dark:text-danger-400">
                Contract Risk
              </p>
              <p className="text-2xl font-bold text-danger-600 mt-1">
                {dashboard.outcomeDistribution.contract_risk || 0}
              </p>
              <p className="text-xs text-danger-600/70 mt-1">&lt;40 points</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Submissions Queue */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Latest submissions requiring review</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/admin/submissions')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.recentSubmissions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No submissions found</p>
                ) : (
                  dashboard.recentSubmissions.map((submission) => (
                    <div
                      key={submission._id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/submissions?id=${submission._id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn('px-2 py-1 rounded text-xs font-medium', categoryColors[submission.category])}>
                          {submission.category}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-50">
                            {submission.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {submission.userId.firstName} {submission.userId.lastName} •{' '}
                            {formatTimeAgo(submission.submittedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                          +{submission.calculatedPoints} pts
                        </span>
                        <Badge variant={statusColors[submission.status] as any}>
                          {submission.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {submission.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {submission.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                          {submission.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Penalties */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Penalties</CardTitle>
                <CardDescription>Recently applied penalties</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/admin/penalties')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.recentPenalties.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No recent penalties</p>
                ) : (
                  dashboard.recentPenalties.map((penalty) => (
                    <div
                      key={penalty._id}
                      className="p-3 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-danger-700 dark:text-danger-400">
                          {penalty.userId.firstName} {penalty.userId.lastName}
                        </span>
                        <span className="text-sm font-bold text-danger-600">
                          {penalty.points} pts
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {penalty.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatTimeAgo(penalty.appliedAt)} by {penalty.appliedBy.firstName}{' '}
                        {penalty.appliedBy.lastName}
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
