'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { mockDashboardData } from '@/lib/mock-data'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SparklineChart } from '@/components/ui/sparkline-chart'
import { cn } from '@/lib/utils'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  FileText, 
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Plus
} from 'lucide-react'

function DashboardContent() {
  const [dashboardData] = useState(mockDashboardData)
  const router = useRouter()

  const { scores, pendingSubmissions, approvedSubmissions, rejectedSubmissions, recentPenalties } = dashboardData

  // Generate trend data for each category (last 12 months)
  const generateTrendData = (currentValue: number, trend: 'up' | 'down' | 'stable' | 'peak') => {
    const data = []
    const baseValue = currentValue * 0.6
    const variation = currentValue * 0.3
    
    for (let i = 0; i < 12; i++) {
      let value = baseValue
      
      if (trend === 'up') {
        value = baseValue + (currentValue - baseValue) * (i / 11) + (Math.random() - 0.5) * variation * 0.3
      } else if (trend === 'down') {
        value = currentValue - (currentValue - baseValue) * (i / 11) + (Math.random() - 0.5) * variation * 0.3
      } else if (trend === 'peak') {
        const peakIndex = 8
        const distanceFromPeak = Math.abs(i - peakIndex)
        value = currentValue + (peakIndex === i ? variation * 0.5 : -distanceFromPeak * variation * 0.1) + (Math.random() - 0.5) * variation * 0.2
      } else {
        value = baseValue + (Math.random() - 0.5) * variation * 0.4
      }
      
      data.push({ value: Math.max(0, value) })
    }
    
    return data
  }

  const researchTrend = generateTrendData(scores.research, 'up')
  const teachingTrend = generateTrendData(scores.teaching, 'down')
  const adminTrend = generateTrendData(scores.admin, 'peak')
  const outreachTrend = generateTrendData(scores.outreach, 'stable')

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'outstanding': return 'text-success-600 dark:text-success-400'
      case 'satisfactory': return 'text-primary-600 dark:text-primary-400'
      case 'improvement_plan': return 'text-warning-600 dark:text-warning-400'
      case 'contract_risk': return 'text-danger-600 dark:text-danger-400'
      default: return 'text-gray-600'
    }
  }

  const getOutcomeBorderColor = (outcome: string) => {
    switch (outcome) {
      case 'outstanding': return 'border-l-success-600'
      case 'satisfactory': return 'border-l-primary-600'
      case 'improvement_plan': return 'border-l-warning-600'
      case 'contract_risk': return 'border-l-danger-600'
      default: return 'border-l-gray-300'
    }
  }

  const getOutcomeLabel = (outcome: string) => {
    switch (outcome) {
      case 'outstanding': return 'Outstanding'
      case 'satisfactory': return 'Satisfactory'
      case 'improvement_plan': return 'Improvement Plan'
      case 'contract_risk': return 'Contract Risk'
      default: return outcome
    }
  }

  const totalPoints = scores.research + scores.teaching + scores.admin + scores.outreach

  // Mock recent submissions data
  const recentSubmissions = [
    { id: 'SUB-001', title: 'Q1 Journal Publication - AI Research', type: 'research', status: 'pending', points: 14.0, date: '2 days ago' },
    { id: 'SUB-002', title: 'Conference Paper - IEEE', type: 'research', status: 'approved', points: 4.2, date: '1 week ago' },
    { id: 'SUB-003', title: 'Student Feedback Score', type: 'teaching', status: 'approved', points: 8.5, date: '2 weeks ago' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
              Faculty Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Academic Year 2024-2025 • Semester 2
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/submissions/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Submission
          </Button>
        </div>

        {/* Metric Cards Row - 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Research */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:border-primary-500 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Research
              </span>
              <ArrowUpRight className="h-4 w-4 text-success-500" />
            </div>
            <div className="text-score-lg font-mono text-gray-900 dark:text-gray-50 mb-1">
                    {scores.research.toFixed(2)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-gray-500">Max: 40 pts</span>
              <div className="w-20 h-8">
                <SparklineChart data={researchTrend} color="#3B82F6" fillColor="#3B82F6" height={32} width={80} />
                </div>
                </div>
              </div>

          {/* Teaching */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:border-primary-500 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Teaching
              </span>
              <ArrowDownRight className="h-4 w-4 text-danger-500" />
            </div>
            <div className="text-score-lg font-mono text-gray-900 dark:text-gray-50 mb-1">
                    {scores.teaching.toFixed(2)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-gray-500">Max: 30 pts</span>
              <div className="w-20 h-8">
                <SparklineChart data={teachingTrend} color="#8B5CF6" fillColor="#8B5CF6" height={32} width={80} />
                </div>
                </div>
              </div>

          {/* Administrative */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:border-primary-500 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Administrative
              </span>
              <TrendingUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="text-score-lg font-mono text-gray-900 dark:text-gray-50 mb-1">
                    {scores.admin.toFixed(2)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-gray-500">Max: 20 pts</span>
              <div className="w-20 h-8">
                <SparklineChart data={adminTrend} color="#10B981" fillColor="#10B981" height={32} width={80} />
                </div>
                </div>
              </div>

          {/* Outreach */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:border-primary-500 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Outreach
              </span>
              <TrendingUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="text-score-lg font-mono text-gray-900 dark:text-gray-50 mb-1">
                    {scores.outreach.toFixed(2)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-gray-500">Max: 10 pts</span>
              <div className="w-20 h-8">
                <SparklineChart data={outreachTrend} color="#F59E0B" fillColor="#F59E0B" height={32} width={80} />
                </div>
                </div>
              </div>
        </div>

        {/* Score Panel + Outcome - 50/50 split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Final Score Panel */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <div className="border-l-4 border-l-primary-500 p-8">
              <div className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Final Score
              </div>
              <div className="text-score-xl font-mono text-gray-900 dark:text-gray-50 mb-6">
                {scores.finalScore.toFixed(2)}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Points</span>
                  <span className="text-sm font-semibold font-mono text-gray-900 dark:text-gray-50">
                    {totalPoints.toFixed(2)}
                </span>
              </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Penalties Applied</span>
                  <span className="text-sm font-semibold font-mono text-danger-600">
                    -{scores.totalPenalties.toFixed(2)}
                </span>
              </div>
              </div>
            </div>
          </div>

          {/* Outcome Panel */}
          <div className={cn(
            "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden",
            "border-l-4",
            getOutcomeBorderColor(scores.outcome as string)
          )}>
            <div className="p-8">
              <div className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Performance Outcome
              </div>
              <div className={cn("text-3xl font-bold mb-4", getOutcomeColor(scores.outcome as string))}>
                {getOutcomeLabel(scores.outcome as string)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Based on your current cumulative performance score of {scores.finalScore.toFixed(2)} points.
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Thresholds: Outstanding ≥80 • Satisfactory ≥60 • Improvement &lt;60 • Risk &lt;40
              </div>
            </div>
          </div>
        </div>

        {/* Submission Status Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Submission Status</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/submissions')}>
                View All
              </Button>
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-warning-50 dark:bg-warning-900/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning-600 dark:text-warning-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-gray-900 dark:text-gray-50">{pendingSubmissions}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Pending Review</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-gray-900 dark:text-gray-50">{approvedSubmissions}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Approved</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-danger-600 dark:text-danger-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-gray-900 dark:text-gray-50">{rejectedSubmissions}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Rejected</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Submissions Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Recent Submissions</h2>
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/submissions/new')}>
              <Plus className="h-4 w-4 mr-1" />
              Add New
              </Button>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Points</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                    <td className="px-4 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">{sub.id}</td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-50">{sub.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{sub.type}</div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={sub.status === 'approved' ? 'success' : sub.status === 'pending' ? 'warning' : 'danger'}>
                        {sub.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {sub.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-mono font-medium text-gray-900 dark:text-gray-50">
                      {sub.points.toFixed(1)}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-500 dark:text-gray-400">{sub.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Penalties Section */}
        {recentPenalties.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Recent Penalties</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/penalties')}>
                View All
              </Button>
        </div>
            <div className="bg-white dark:bg-gray-900 border border-danger-200 dark:border-danger-800 rounded-lg overflow-hidden border-l-4 border-l-danger-600">
              {recentPenalties.map((penalty, index) => (
                  <div
                    key={penalty._id}
                    className={cn(
                    "flex items-center justify-between p-4",
                    index !== recentPenalties.length - 1 && "border-b border-gray-100 dark:border-gray-800"
                    )}
                  >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-danger-600 dark:text-danger-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-50">{penalty.description}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {penalty.type} • {new Date(penalty.appliedAt).toLocaleDateString()}
                      </div>
                    </div>
                    </div>
                  <div className="text-base font-bold font-mono text-danger-600 dark:text-danger-500">
                    -{penalty.points} pts
                    </div>
                  </div>
                ))}
              </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
                onClick={() => router.push('/dashboard/submissions/new?category=research')}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors text-left group"
            >
              <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-900/30 transition-colors">
                <FileText className="h-5 w-5 text-primary-600 dark:text-primary-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-50">Submit Research</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Journal, conference, patent</div>
              </div>
            </button>
            <button
                onClick={() => router.push('/dashboard/submissions/new?category=teaching')}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors text-left group"
            >
              <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-900/30 transition-colors">
                <FileText className="h-5 w-5 text-primary-600 dark:text-primary-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-50">Submit Teaching</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Feedback, materials, syllabus</div>
              </div>
            </button>
            <button
                onClick={() => router.push('/dashboard/submissions/new?category=admin')}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors text-left group"
            >
              <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-900/30 transition-colors">
                <FileText className="h-5 w-5 text-primary-600 dark:text-primary-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-50">Submit Admin/Service</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Committee work, events</div>
              </div>
            </button>
          </div>
            </div>
      </div>
    </DashboardLayout>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
