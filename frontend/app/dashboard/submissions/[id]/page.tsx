'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { facultyApi } from '@/lib/api/faculty'
import type { Submission } from '@/lib/api/faculty'
import { cn } from '@/lib/utils'
import { 
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  ExternalLink,
  FileText,
  Info,
  Link as LinkIcon,
  MessageSquare,
  User,
  XCircle
} from 'lucide-react'

function SubmissionDetailContent() {
  const params = useParams()
  const router = useRouter()
  const submissionId = params.id as string
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    facultyApi
      .getSubmission(submissionId)
      .then(setSubmission)
      .catch(() => setError('Failed to load submission'))
      .finally(() => setLoading(false))
  }, [submissionId])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !submission) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
            {error ?? 'Submission Not Found'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            The submission you're looking for doesn't exist or you don't have access.
          </p>
          <Button onClick={() => router.push('/dashboard/submissions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Submissions
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { 
          variant: 'success' as const, 
          icon: CheckCircle, 
          label: 'Approved',
          bgColor: 'bg-success-50 dark:bg-success-900/10',
          borderColor: 'border-success-200 dark:border-success-900/30',
          textColor: 'text-success-700 dark:text-success-300'
        }
      case 'pending':
        return { 
          variant: 'warning' as const, 
          icon: Clock, 
          label: 'Pending Review',
          bgColor: 'bg-warning-50 dark:bg-warning-900/10',
          borderColor: 'border-warning-200 dark:border-warning-900/30',
          textColor: 'text-warning-700 dark:text-warning-300'
        }
      case 'changes_requested':
        return { 
          variant: 'warning' as const, 
          icon: MessageSquare, 
          label: 'Changes requested',
          bgColor: 'bg-amber-50 dark:bg-amber-900/10',
          borderColor: 'border-amber-200 dark:border-amber-900/30',
          textColor: 'text-amber-700 dark:text-amber-300'
        }
      case 'rejected':
        return { 
          variant: 'danger' as const, 
          icon: XCircle, 
          label: 'Rejected',
          bgColor: 'bg-danger-50 dark:bg-danger-900/10',
          borderColor: 'border-danger-200 dark:border-danger-900/30',
          textColor: 'text-danger-700 dark:text-danger-300'
        }
      default:
        return { 
          variant: 'default' as const, 
          icon: FileText, 
          label: status,
          bgColor: 'bg-gray-50 dark:bg-gray-900',
          borderColor: 'border-gray-200 dark:border-gray-800',
          textColor: 'text-gray-700 dark:text-gray-300'
        }
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      research: 'Research',
      teaching: 'Teaching',
      admin: 'Administrative',
      outreach: 'Outreach',
    }
    return labels[category] || category
  }

  const statusConfig = getStatusConfig(submission.status)
  const StatusIcon = statusConfig.icon

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button & Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
              Submission Details
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              ID: {submission._id}
            </p>
          </div>
          {(submission.status === 'pending' || submission.status === 'changes_requested') && (
            <Button variant="outline" onClick={() => router.push(`/dashboard/submissions/${submission._id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              {submission.status === 'changes_requested' ? 'Edit and resubmit' : 'Edit Submission'}
            </Button>
          )}
        </div>

        {/* Status Banner */}
        <div className={cn(
          "rounded-lg p-4 border",
          statusConfig.bgColor,
          statusConfig.borderColor
        )}>
          <div className="flex items-center gap-3">
            <StatusIcon className={cn("h-5 w-5", statusConfig.textColor)} />
            <div>
              <div className={cn("font-medium", statusConfig.textColor)}>
                {statusConfig.label}
              </div>
              {submission.status === 'pending' && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Your submission is being reviewed by the administrator.
                </p>
              )}
              {submission.status === 'changes_requested' && submission.adminNotes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Admin requested changes: {submission.adminNotes}
                </p>
              )}
              {submission.status === 'approved' && submission.reviewedAt && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Approved on {new Date(submission.reviewedAt).toLocaleDateString()}
                </p>
              )}
              {submission.status === 'rejected' && submission.adminNotes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Reason: {submission.adminNotes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Description */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                {submission.title}
              </h2>
              {submission.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {submission.description}
                </p>
              )}
              <div className="flex items-center gap-4">
                <Badge variant="primary">{getCategoryLabel(submission.category)}</Badge>
                <span className="text-sm text-gray-500 capitalize">{submission.subcategory}</span>
              </div>
            </div>

            {/* Evidence Section */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4 uppercase tracking-wider">
                Evidence
              </h3>
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {submission.evidence.type === 'link' && (
                  <>
                    <LinkIcon className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-50">External Link</div>
                      <a 
                        href={submission.evidence.value} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1 mt-1"
                      >
                        {submission.evidence.value}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </>
                )}
                {submission.evidence.type === 'file' && (
                  <>
                    <FileText className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-50">Uploaded File</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {submission.evidence.value}
                      </div>
                    </div>
                  </>
                )}
                {submission.evidence.type === 'text' && (
                  <>
                    <FileText className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-50">Description</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {submission.evidence.value}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Metadata Section */}
            {Object.keys(submission.metadata).length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4 uppercase tracking-wider">
                  Additional Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(submission.metadata).map(([key, value]) => (
                    <div key={key} className="py-2">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className="text-sm text-gray-900 dark:text-gray-50">
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar Info */}
          <div className="space-y-6">
            {/* Points Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4 uppercase tracking-wider">
                Points
              </h3>
              <div className="text-center">
                <div className="text-4xl font-bold font-mono text-gray-900 dark:text-gray-50">
                  {submission.calculatedPoints.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 mt-1">Calculated Points</div>
              </div>
              {submission.status === 'approved' && (
                <div className="mt-4 p-3 bg-success-50 dark:bg-success-900/10 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-success-700 dark:text-success-300">
                    <CheckCircle className="h-4 w-4" />
                    Points added to your score
                  </div>
                </div>
              )}
              {submission.status === 'pending' && (
                <div className="mt-4 p-3 bg-warning-50 dark:bg-warning-900/10 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-warning-700 dark:text-warning-300">
                    <Clock className="h-4 w-4" />
                    Points pending approval
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4 uppercase tracking-wider">
                Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-50">Submitted</div>
                    <div className="text-xs text-gray-500">
                      {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {submission.reviewedAt && (
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                      submission.status === 'approved' 
                        ? "bg-success-100 dark:bg-success-900/20" 
                        : "bg-danger-100 dark:bg-danger-900/20"
                    )}>
                      {submission.status === 'approved' ? (
                        <CheckCircle className="h-4 w-4 text-success-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-danger-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                        {submission.status === 'approved' ? 'Approved' : 'Rejected'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(submission.reviewedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {submission.status === 'pending' && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Awaiting Review</div>
                      <div className="text-xs text-gray-400">Pending administrator approval</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4 uppercase tracking-wider">
                Actions
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/dashboard/submissions')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Submissions
                </Button>
                {submission.status === 'pending' && (
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push(`/dashboard/submissions/${submission._id}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Submission
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function SubmissionDetailPage() {
  return (
    <ProtectedRoute>
      <SubmissionDetailContent />
    </ProtectedRoute>
  )
}
