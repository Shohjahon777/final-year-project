'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { vacationApi, Vacation } from '@/lib/api/vacation'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  X,
  Ban,
  ChevronRight,
  AlertCircle,
  Plane,
  Stethoscope,
  DollarSign,
  MoreHorizontal,
} from 'lucide-react'

// ─── Types & constants ────────────────────────────────────────────────────────

const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  annual:  { label: 'Annual Leave',  icon: Plane,         color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50' },
  sick:    { label: 'Sick Leave',    icon: Stethoscope,   color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50' },
  unpaid:  { label: 'Unpaid Leave',  icon: DollarSign,    color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50' },
  other:   { label: 'Other',         icon: MoreHorizontal, color: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50' },
}

const STATUS_META: Record<string, { label: string; icon: any; variant: 'warning' | 'success' | 'danger' | 'default' }> = {
  pending:   { label: 'Pending Review', icon: Clock,        variant: 'warning' },
  approved:  { label: 'Approved',       icon: CheckCircle,  variant: 'success' },
  rejected:  { label: 'Rejected',       icon: XCircle,      variant: 'danger'  },
  cancelled: { label: 'Cancelled',      icon: Ban,          variant: 'default' },
}

const FILTER_TABS = [
  { id: 'all',       label: 'All Requests' },
  { id: 'pending',   label: 'Pending' },
  { id: 'approved',  label: 'Approved' },
  { id: 'rejected',  label: 'Rejected' },
  { id: 'cancelled', label: 'Cancelled' },
] as const

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function daysBetween(start: string, end: string) {
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1
}

const defaultForm = {
  dateRange: { start: '', end: '' },
  reason: '',
  type: 'annual' as 'annual' | 'sick' | 'unpaid' | 'other',
}

// ─── Main component ───────────────────────────────────────────────────────────

function VacationsContent() {
  const [vacations, setVacations]     = useState<Vacation[]>([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [form, setForm]               = useState(defaultForm)
  const { success, error: showError } = useToast()

  const fetchVacations = async () => {
    setLoading(true)
    try {
      const data = await vacationApi.getMyRequests()
      setVacations(data)
    } catch {
      showError('Failed to load', 'Could not fetch your vacation requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVacations() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.dateRange.start || !form.dateRange.end) {
      showError('Missing dates', 'Please select a date range.')
      return
    }
    if (!form.reason.trim()) {
      showError('Missing reason', 'Please provide a reason for your leave.')
      return
    }
    setSubmitting(true)
    try {
      await vacationApi.createRequest({
        startDate: form.dateRange.start,
        endDate: form.dateRange.end,
        reason: form.reason,
        type: form.type,
      })
      success('Request submitted', 'Your vacation request has been sent for review.')
      setForm(defaultForm)
      setShowForm(false)
      fetchVacations()
    } catch {
      showError('Submission failed', 'Could not submit your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    try {
      await vacationApi.cancelRequest(id)
      success('Request withdrawn', 'Your vacation request has been cancelled.')
      fetchVacations()
    } catch {
      showError('Cancel failed', 'Could not cancel the request. Please try again.')
    } finally {
      setCancellingId(null)
    }
  }

  const stats = {
    total:     vacations.length,
    pending:   vacations.filter(v => v.status === 'pending').length,
    approved:  vacations.filter(v => v.status === 'approved').length,
    rejected:  vacations.filter(v => v.status === 'rejected').length,
    cancelled: vacations.filter(v => v.status === 'cancelled').length,
  }

  const approvedDays = vacations
    .filter(v => v.status === 'approved')
    .reduce((sum, v) => sum + daysBetween(v.startDate, v.endDate), 0)

  const pendingDays = vacations
    .filter(v => v.status === 'pending')
    .reduce((sum, v) => sum + daysBetween(v.startDate, v.endDate), 0)

  const filtered = activeFilter === 'all'
    ? vacations
    : vacations.filter(v => v.status === activeFilter)

  const today = new Date().toISOString().split('T')[0]

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
              Leave Requests
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Submit and track your vacation and leave applications
            </p>
          </div>
          <Button onClick={() => setShowForm(v => !v)}>
            {showForm ? (
              <><X className="h-4 w-4 mr-2" />Cancel</>
            ) : (
              <><Plus className="h-4 w-4 mr-2" />New Request</>
            )}
          </Button>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Approved days */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-500" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Approved
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-gray-900 dark:text-gray-50">{approvedDays}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">days granted · {stats.approved} request{stats.approved !== 1 ? 's' : ''}</div>
          </div>

          {/* Pending days */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-lg bg-warning-50 dark:bg-warning-900/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning-600 dark:text-warning-500" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Pending
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-gray-900 dark:text-gray-50">{pendingDays}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">days awaiting · {stats.pending} request{stats.pending !== 1 ? 's' : ''}</div>
          </div>

          {/* Rejected */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-lg bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-danger-600 dark:text-danger-500" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Rejected
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-gray-900 dark:text-gray-50">{stats.rejected}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">request{stats.rejected !== 1 ? 's' : ''} declined</div>
          </div>

          {/* Total */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-gray-900 dark:text-gray-50">{stats.total}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">all-time submissions</div>
          </div>
        </div>

        {/* ── New Request Form ── */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <div className="border-l-4 border-l-primary-500 px-6 py-4 bg-primary-50/50 dark:bg-primary-900/10">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">New Leave Request</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Fill in the details below — admin will review and respond.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Leave type picker */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">
                  Leave Type <span className="text-danger-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(TYPE_META) as Array<keyof typeof TYPE_META>).map((key) => {
                    const meta = TYPE_META[key]
                    const Icon = meta.icon
                    const selected = form.type === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm({ ...form, type: key as typeof form.type })}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-3 rounded-lg border text-sm font-medium transition-all',
                          selected
                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-500/50'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{meta.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Date range picker */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">
                  Date Range <span className="text-danger-500">*</span>
                </label>
                <DateRangePicker
                  value={form.dateRange}
                  onChange={(range) => setForm({ ...form, dateRange: range })}
                  minDate={today}
                  placeholder="Click to select start and end dates"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">
                  Reason <span className="text-danger-500">*</span>
                </label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Briefly describe the purpose of your leave request…"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 px-3 py-2 resize-none focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-1 border-t border-gray-100 dark:border-gray-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setForm(defaultForm); setShowForm(false) }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  )}
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── History section ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Request History</h2>
          </div>

          {/* Filter tabs */}
          <div className="border-b border-gray-200 dark:border-gray-800 mb-4">
            <nav className="flex gap-6">
              {FILTER_TABS.map((tab) => {
                const count = tab.id === 'all'
                  ? vacations.length
                  : stats[tab.id as keyof typeof stats] ?? 0
                const isActive = activeFilter === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={cn(
                      'flex items-center gap-2 py-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap',
                      isActive
                        ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    )}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span className={cn(
                        'ml-0.5 rounded-full px-2 py-0.5 text-xs',
                        isActive
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Empty state */}
          {vacations.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-1">No leave requests yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Submit your first leave request to get started.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">No {activeFilter} requests found.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((v) => {
                const typeMeta   = TYPE_META[v.type]   ?? TYPE_META.other
                const statusMeta = STATUS_META[v.status] ?? STATUS_META.pending
                const TypeIcon   = typeMeta.icon
                const StatusIcon = statusMeta.icon
                const days       = daysBetween(v.startDate, v.endDate)
                const isCancelling = cancellingId === v._id

                return (
                  <div
                    key={v._id}
                    className={cn(
                      'flex items-start gap-5 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                      v.status === 'cancelled' && 'opacity-55'
                    )}
                  >
                    {/* Type icon */}
                    <div className={cn('h-10 w-10 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5', typeMeta.color)}>
                      <TypeIcon className="h-4 w-4" />
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      {/* Row 1: type label + status badge */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                          {typeMeta.label}
                        </span>
                        <Badge variant={statusMeta.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusMeta.label}
                        </Badge>
                      </div>

                      {/* Row 2: date range + duration */}
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-1.5">
                        <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>
                          {formatDateShort(v.startDate)}
                          {' '}
                          <ChevronRight className="h-3 w-3 inline" />
                          {' '}
                          {formatDateShort(v.endDate)}
                        </span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {days} day{days !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          · submitted {formatDate(v.createdAt)}
                        </span>
                      </div>

                      {/* Row 3: reason */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {v.reason}
                      </p>

                      {/* Row 4: admin note */}
                      {v.adminComment && (
                        <div className={cn(
                          'flex items-start gap-2 mt-2 px-3 py-2 rounded-md text-sm border',
                          v.status === 'approved'
                            ? 'bg-success-50 dark:bg-success-900/10 border-success-200 dark:border-success-800/50 text-success-700 dark:text-success-300'
                            : 'bg-danger-50 dark:bg-danger-900/10 border-danger-200 dark:border-danger-800/50 text-danger-700 dark:text-danger-300'
                        )}>
                          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                          <span><span className="font-medium">Admin note:</span> {v.adminComment}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: withdraw button for pending */}
                    {v.status === 'pending' && (
                      <div className="flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(v._id)}
                          disabled={isCancelling}
                          className="text-danger-600 dark:text-danger-400 border-danger-200 dark:border-danger-800/50 hover:bg-danger-50 dark:hover:bg-danger-900/20 hover:border-danger-300"
                        >
                          {isCancelling ? (
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-danger-400 border-t-transparent mr-1.5" />
                          ) : (
                            <X className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          {isCancelling ? 'Withdrawing…' : 'Withdraw'}
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}

export default function VacationsPage() {
  return (
    <ProtectedRoute>
      <VacationsContent />
    </ProtectedRoute>
  )
}
