'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MessageSquare,
} from 'lucide-react'
import { vacationApi, Vacation } from '@/lib/api/vacation'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const typeLabels: Record<string, string> = {
  annual: 'Annual Leave',
  sick: 'Sick Leave',
  unpaid: 'Unpaid Leave',
  other: 'Other',
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    className: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function daysBetween(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
}

export default function AdminVacationsPage() {
  const [vacations, setVacations] = useState<Vacation[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [commentMap, setCommentMap] = useState<Record<string, string>>({})
  const [showComment, setShowComment] = useState<Record<string, boolean>>({})
  const { success, error: showError } = useToast()

  const fetchVacations = async () => {
    setLoading(true)
    try {
      const result = await vacationApi.getAllRequests({
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
        limit: 15,
      })
      setVacations(result.vacations)
      setTotalPages(result.pagination.pages)
      setTotal(result.pagination.total)
    } catch {
      showError('Failed to load', 'Could not fetch vacation requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVacations()
  }, [statusFilter, page])

  const handleReview = async (id: string, action: 'approved' | 'rejected') => {
    setReviewingId(id)
    try {
      await vacationApi.reviewRequest(id, action, commentMap[id])
      success(
        action === 'approved' ? 'Request approved' : 'Request rejected',
        `Vacation request has been ${action}.`
      )
      fetchVacations()
      setCommentMap((prev) => { const next = { ...prev }; delete next[id]; return next })
      setShowComment((prev) => { const next = { ...prev }; delete next[id]; return next })
    } catch {
      showError('Failed', `Could not ${action} the request.`)
    } finally {
      setReviewingId(null)
    }
  }

  const stats = {
    pending: vacations.filter(v => v.status === 'pending').length,
    approved: vacations.filter(v => v.status === 'approved').length,
    rejected: vacations.filter(v => v.status === 'rejected').length,
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Link href="/admin" className="hover:text-gray-700 dark:hover:text-gray-300">Admin</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-50 font-medium">Vacations</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Vacation Requests</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{total} total request{total !== 1 ? 's' : ''}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={fetchVacations}
          className="h-8 w-8 p-0"
          title="Refresh"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/50 p-3">
          <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">Pending</p>
          <p className="text-xl font-bold text-amber-900 dark:text-amber-300 mt-0.5">{stats.pending}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/50 p-3">
          <p className="text-[10px] font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">Approved</p>
          <p className="text-xl font-bold text-green-900 dark:text-green-300 mt-0.5">{stats.approved}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/50 p-3">
          <p className="text-[10px] font-medium text-red-700 dark:text-red-400 uppercase tracking-wide">Rejected</p>
          <p className="text-xl font-bold text-red-900 dark:text-red-300 mt-0.5">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-2.5">
        <div className="flex items-center gap-1">
          {['all', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize',
                statusFilter === s
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Request List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-48 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
              <p className="mt-2 text-xs text-gray-500">Loading requests...</p>
            </div>
          </div>
        ) : vacations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <CalendarDays className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">No vacation requests</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {statusFilter !== 'all' ? `No ${statusFilter} requests found.` : 'No requests have been submitted yet.'}
            </p>
          </div>
        ) : (
          vacations.map((v) => {
            const cfg = statusConfig[v.status]
            const StatusIcon = cfg.icon
            const days = daysBetween(v.startDate, v.endDate)

            return (
              <div
                key={v._id}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: requester + details */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-semibold text-sm text-blue-700 dark:text-blue-400 flex-shrink-0">
                      {v.userId.firstName[0]}{v.userId.lastName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-50">
                          {v.userId.firstName} {v.userId.lastName}
                        </p>
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
                          cfg.className
                        )}>
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {typeLabels[v.type] || v.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {v.userId.email} · {v.userId.department || 'No dept'} · {v.userId.facultyRank || 'No rank'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(v.startDate)} → {formatDate(v.endDate)}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">
                          {days} day{days !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded px-2 py-1 mt-1">
                        <span className="font-medium">Reason:</span> {v.reason}
                      </p>
                      {v.adminComment && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                          Admin note: {v.adminComment}
                        </p>
                      )}
                      {v.reviewedBy && v.reviewedAt && (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                          Reviewed by {v.reviewedBy.firstName} {v.reviewedBy.lastName} on {formatDate(v.reviewedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: actions (only for pending) */}
                  {v.status === 'pending' && (
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setShowComment(prev => ({ ...prev, [v._id]: !prev[v._id] }))}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="Add comment"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-xs border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          disabled={reviewingId === v._id}
                          onClick={() => handleReview(v._id, 'rejected')}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 px-2.5 text-xs bg-green-600 hover:bg-green-700 text-white"
                          disabled={reviewingId === v._id}
                          onClick={() => handleReview(v._id, 'approved')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      </div>
                      {showComment[v._id] && (
                        <textarea
                          value={commentMap[v._id] || ''}
                          onChange={(e) => setCommentMap(prev => ({ ...prev, [v._id]: e.target.value }))}
                          placeholder="Optional note for the requester..."
                          rows={2}
                          className="w-56 text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="text-xs ml-1">Prev</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              <span className="text-xs mr-1">Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
