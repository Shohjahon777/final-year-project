'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerContent,
  DrawerFooter,
  DrawerSection,
  DrawerInfoRow,
} from '@/components/ui/drawer'
import { getMockSubmissions, Submission } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Clock, 
  CheckCircle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  Calculator,
  MessageSquare,
  User,
  ArrowLeft,
  Upload,
  Save,
  X,
} from 'lucide-react'

type EvidenceType = 'link' | 'file' | 'text'

// Tab data
const tabs = [
  { id: 'all', label: 'All', icon: null },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'approved', label: 'Approved', icon: CheckCircle },
  { id: 'rejected', label: 'Rejected', icon: XCircle },
]

function SubmissionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'all')
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    category: searchParams.get('category') || '',
    page: parseInt(searchParams.get('page') || '1'),
    limit: 10,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit'>('view')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    evidenceType: 'link' as EvidenceType,
    evidenceValue: '',
    metadata: {} as Record<string, any>,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSubmissions()
  }, [filters])

  useEffect(() => {
    // Sync tab with filter
    setFilters(prev => ({
      ...prev,
      status: activeTab === 'all' ? '' : activeTab,
      page: 1,
    }))
  }, [activeTab])

  const loadSubmissions = () => {
    setLoading(true)
    const result = getMockSubmissions(filters)
    setSubmissions(result.submissions)
    setPagination(result.pagination)
    setLoading(false)
  }

  const openSubmissionDrawer = (submission: Submission) => {
    setSelectedSubmission(submission)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  const openEditMode = () => {
    if (!selectedSubmission) return
    setEditFormData({
      title: selectedSubmission.title,
      description: selectedSubmission.description || '',
      evidenceType: selectedSubmission.evidence.type as EvidenceType,
      evidenceValue: selectedSubmission.evidence.value,
      metadata: { ...selectedSubmission.metadata },
    })
    setDrawerMode('edit')
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setSelectedSubmission(null)
    setDrawerMode('view')
    setEditFormData({
      title: '',
      description: '',
      evidenceType: 'link',
      evidenceValue: '',
      metadata: {},
    })
  }

  const handleSaveEdit = async () => {
    if (!selectedSubmission) return
    setSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update local state (in real app, this would refetch from API)
    const updatedSubmission: Submission = {
      ...selectedSubmission,
      title: editFormData.title,
      description: editFormData.description,
      evidence: {
        type: editFormData.evidenceType,
        value: editFormData.evidenceValue,
      },
      metadata: editFormData.metadata,
    }
    
    setSelectedSubmission(updatedSubmission)
    setDrawerMode('view')
    setSaving(false)
    loadSubmissions()
  }

  const updateMetadata = (key: string, value: any) => {
    setEditFormData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value },
    }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="warning">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="success">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case 'rejected':
    return (
          <Badge variant="danger">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      research: 'Research',
      teaching: 'Teaching',
      admin: 'Admin/Service',
      outreach: 'Outreach',
    }
    return labels[category] || category
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateFull = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Filter submissions by search query
  const filteredSubmissions = submissions.filter(sub => 
    sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get count for each status tab
  const getCounts = () => {
    const allSubmissions = getMockSubmissions({ status: '', category: filters.category, page: 1, limit: 100 })
    const pending = allSubmissions.submissions.filter(s => s.status === 'pending').length
    const approved = allSubmissions.submissions.filter(s => s.status === 'approved').length
    const rejected = allSubmissions.submissions.filter(s => s.status === 'rejected').length
    return { all: allSubmissions.submissions.length, pending, approved, rejected }
  }

  const counts = getCounts()

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { 
          bgColor: 'bg-success-50 dark:bg-success-900/10',
          borderColor: 'border-success-200 dark:border-success-900/30',
          textColor: 'text-success-700 dark:text-success-300',
          message: 'Points added to your score'
        }
      case 'pending':
        return { 
          bgColor: 'bg-warning-50 dark:bg-warning-900/10',
          borderColor: 'border-warning-200 dark:border-warning-900/30',
          textColor: 'text-warning-700 dark:text-warning-300',
          message: 'Your submission is being reviewed'
        }
      case 'rejected':
        return { 
          bgColor: 'bg-danger-50 dark:bg-danger-900/10',
          borderColor: 'border-danger-200 dark:border-danger-900/30',
          textColor: 'text-danger-700 dark:text-danger-300',
          message: 'Submission was rejected'
        }
      default:
        return { 
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          textColor: 'text-gray-700 dark:text-gray-300',
          message: ''
        }
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
              My Submissions
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View and manage your activity submissions
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/submissions/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Submission
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex gap-6">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              const count = counts[tab.id as keyof typeof counts]
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 py-3 border-b-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary-600 text-primary-600 dark:text-primary-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  )}
                >
                  {tab.icon && <tab.icon className="h-4 w-4" />}
                  {tab.label}
                  <span className={cn(
                    "ml-1 rounded-full px-2 py-0.5 text-xs",
                    isActive 
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300" 
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  )}>
                    {count}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
              </div>

          {/* Category Filter */}
                <select
                  value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                >
                  <option value="">All Categories</option>
                  <option value="research">Research</option>
                  <option value="teaching">Teaching</option>
                  <option value="admin">Admin/Service</option>
                  <option value="outreach">Outreach</option>
                </select>

          {/* Date Range (placeholder) */}
          <Button variant="outline" size="default" className="gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
                </Button>
              </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-primary-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-500">Loading submissions...</p>
            </div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-1">No submissions found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery ? 'Try adjusting your search query' : 'Start by creating your first submission'}
            </p>
              <Button onClick={() => router.push('/dashboard/submissions/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Submission
              </Button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Points</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Submitted</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredSubmissions.map((submission, index) => (
                  <tr 
                    key={submission._id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => openSubmissionDrawer(submission)}
                  >
                    <td className="px-4 py-4 text-sm font-mono text-gray-500 dark:text-gray-400">
                      {String(index + 1).padStart(3, '0')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-50">{submission.title}</div>
                    {submission.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">{submission.description}</div>
                    )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{getCategoryLabel(submission.category)}</div>
                      <div className="text-xs text-gray-400">{submission.subcategory}</div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(submission.status)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-semibold font-mono text-gray-900 dark:text-gray-50">
                        {submission.calculatedPoints.toFixed(1)}
                          </span>
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-500">
                      {formatDate(submission.submittedAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openSubmissionDrawer(submission)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {submission.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => router.push(`/dashboard/submissions/${submission._id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} submissions
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page === 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                      >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page === pagination.pages}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                      >
                        Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
            )}
          </div>
        )}
      </div>

      {/* Submission Detail Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        {selectedSubmission && drawerMode === 'view' && (
          <>
            <DrawerHeader breadcrumb="Submissions / View">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="primary">{getCategoryLabel(selectedSubmission.category)}</Badge>
                {getStatusBadge(selectedSubmission.status)}
              </div>
              <DrawerTitle>{selectedSubmission.title}</DrawerTitle>
              <DrawerDescription>
                {selectedSubmission.subcategory} • ID: {selectedSubmission._id}
              </DrawerDescription>
            </DrawerHeader>

            <DrawerContent className="space-y-6">
              {/* Status Banner */}
              {(() => {
                const statusConfig = getStatusConfig(selectedSubmission.status)
                return (
                  <div className={cn(
                    "rounded-lg p-4 border",
                    statusConfig.bgColor,
                    statusConfig.borderColor
                  )}>
                    <div className="flex items-center gap-3">
                      {selectedSubmission.status === 'pending' && <Clock className={cn("h-5 w-5", statusConfig.textColor)} />}
                      {selectedSubmission.status === 'approved' && <CheckCircle className={cn("h-5 w-5", statusConfig.textColor)} />}
                      {selectedSubmission.status === 'rejected' && <XCircle className={cn("h-5 w-5", statusConfig.textColor)} />}
                      <div>
                        <div className={cn("font-medium capitalize", statusConfig.textColor)}>
                          {selectedSubmission.status}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {statusConfig.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Key Information */}
              <div className="space-y-1 border-b border-gray-200 dark:border-gray-800 pb-4">
                <DrawerInfoRow icon={<Calendar className="h-4 w-4" />} label="Submitted">
                  {formatDateFull(selectedSubmission.submittedAt)}
                </DrawerInfoRow>
                <DrawerInfoRow icon={<Tag className="h-4 w-4" />} label="Category">
                  {getCategoryLabel(selectedSubmission.category)}
                </DrawerInfoRow>
                <DrawerInfoRow icon={<FileText className="h-4 w-4" />} label="Subcategory">
                  {selectedSubmission.subcategory}
                </DrawerInfoRow>
                {selectedSubmission.reviewedAt && (
                  <DrawerInfoRow icon={<CheckCircle className="h-4 w-4" />} label="Reviewed">
                    {formatDateFull(selectedSubmission.reviewedAt)}
                  </DrawerInfoRow>
                )}
              </div>

              {/* Description */}
              {selectedSubmission.description && (
                <DrawerSection icon={<MessageSquare className="h-4 w-4" />} label="Description">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                    {selectedSubmission.description}
                  </div>
                </DrawerSection>
              )}

              {/* Evidence */}
              <DrawerSection icon={<LinkIcon className="h-4 w-4" />} label="Evidence">
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  {selectedSubmission.evidence.type === 'link' ? (
                    <a
                      href={selectedSubmission.evidence.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="truncate">{selectedSubmission.evidence.value}</span>
                    </a>
                  ) : selectedSubmission.evidence.type === 'file' ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{selectedSubmission.evidence.value}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary-600">
                        Download
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedSubmission.evidence.value}
                    </p>
                  )}
                </div>
              </DrawerSection>

              {/* Metadata */}
              {selectedSubmission.metadata && Object.keys(selectedSubmission.metadata).length > 0 && (
                <DrawerSection icon={<FileText className="h-4 w-4" />} label="Additional Details">
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(selectedSubmission.metadata).map(([key, value]) => (
                      <div key={key} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 capitalize mb-1">
                          {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </DrawerSection>
              )}

              {/* Points */}
              <DrawerSection icon={<Calculator className="h-4 w-4" />} label="Points">
                <div className={cn(
                  "p-4 rounded-lg border",
                  selectedSubmission.status === 'approved'
                    ? "bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800"
                    : selectedSubmission.status === 'pending'
                    ? "bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                )}>
                  <div className="text-center">
                    <p className="text-3xl font-bold font-mono text-gray-900 dark:text-gray-50">
                      {selectedSubmission.calculatedPoints.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedSubmission.status === 'approved' 
                        ? 'Points added to your score'
                        : selectedSubmission.status === 'pending'
                        ? 'Points pending approval'
                        : 'Points not awarded'}
                    </p>
                  </div>
                </div>
              </DrawerSection>

              {/* Admin Notes (if rejected) */}
              {selectedSubmission.status === 'rejected' && selectedSubmission.adminNotes && (
                <DrawerSection icon={<MessageSquare className="h-4 w-4" />} label="Admin Notes">
                  <div className="p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg text-sm text-danger-700 dark:text-danger-300 border border-danger-200 dark:border-danger-800">
                    {selectedSubmission.adminNotes}
                  </div>
                </DrawerSection>
              )}

              {/* Timeline */}
              <DrawerSection icon={<Calendar className="h-4 w-4" />} label="Timeline">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary-600" />
                    <span className="text-gray-500">Submitted</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatDateFull(selectedSubmission.submittedAt)}
                    </span>
                  </div>
                  {selectedSubmission.reviewedAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full',
                          selectedSubmission.status === 'approved'
                            ? 'bg-success-600'
                            : 'bg-danger-600'
                        )}
                      />
                      <span className="text-gray-500">
                        {selectedSubmission.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {formatDateFull(selectedSubmission.reviewedAt)}
                      </span>
                    </div>
                  )}
                  {selectedSubmission.status === 'pending' && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                      <span className="text-gray-500">Awaiting Review</span>
                      <span className="text-gray-400">Pending</span>
                    </div>
                  )}
                </div>
              </DrawerSection>
            </DrawerContent>

            <DrawerFooter>
              <Button variant="outline" onClick={closeDrawer}>
                Close
              </Button>
              {selectedSubmission.status === 'pending' && (
                <Button variant="outline" onClick={openEditMode}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Submission
                </Button>
              )}
            </DrawerFooter>
          </>
        )}

        {/* Edit Mode */}
        {selectedSubmission && drawerMode === 'edit' && (
          <>
            <DrawerHeader breadcrumb="Submissions / Edit">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="primary">{getCategoryLabel(selectedSubmission.category)}</Badge>
                <Badge variant="warning">Editing</Badge>
              </div>
              <DrawerTitle>Edit Submission</DrawerTitle>
              <DrawerDescription>
                Update your submission details before review
              </DrawerDescription>
            </DrawerHeader>

            <DrawerContent className="space-y-6">
              {/* Title */}
              <DrawerSection icon={<FileText className="h-4 w-4" />} label="Title">
                <Input
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="Enter submission title"
                />
              </DrawerSection>

              {/* Description */}
              <DrawerSection icon={<MessageSquare className="h-4 w-4" />} label="Description">
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[100px] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Provide additional details about your submission"
                />
              </DrawerSection>

              {/* Evidence Type */}
              <DrawerSection icon={<LinkIcon className="h-4 w-4" />} label="Evidence">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">Evidence Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'link', label: 'Link/URL', icon: LinkIcon },
                        { value: 'file', label: 'File', icon: Upload },
                        { value: 'text', label: 'Description', icon: FileText },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, evidenceType: opt.value as EvidenceType })}
                          className={cn(
                            "py-2 px-3 text-sm rounded-md border transition-colors flex items-center justify-center gap-2",
                            editFormData.evidenceType === opt.value
                              ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                              : "border-gray-300 hover:border-gray-400 dark:border-gray-700"
                          )}
                        >
                          <opt.icon className="h-4 w-4" />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">
                      {editFormData.evidenceType === 'link' ? 'URL' : editFormData.evidenceType === 'file' ? 'File' : 'Description'}
                    </label>
                    {editFormData.evidenceType === 'text' ? (
                      <textarea
                        value={editFormData.evidenceValue}
                        onChange={(e) => setEditFormData({ ...editFormData, evidenceValue: e.target.value })}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[80px] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        placeholder="Describe your evidence"
                      />
                    ) : (
                      <Input
                        type={editFormData.evidenceType === 'link' ? 'url' : 'text'}
                        value={editFormData.evidenceValue}
                        onChange={(e) => setEditFormData({ ...editFormData, evidenceValue: e.target.value })}
                        placeholder={editFormData.evidenceType === 'link' ? 'https://doi.org/...' : 'Select file...'}
                      />
                    )}
                  </div>
                </div>
              </DrawerSection>

              {/* Metadata */}
              {selectedSubmission.metadata && Object.keys(selectedSubmission.metadata).length > 0 && (
                <DrawerSection icon={<Tag className="h-4 w-4" />} label="Additional Details">
                  <div className="space-y-3">
                    {Object.entries(editFormData.metadata).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-xs text-gray-500 capitalize mb-1 block">
                          {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                        </label>
                        {typeof value === 'boolean' ? (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => updateMetadata(key, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                          </label>
                        ) : typeof value === 'number' ? (
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => updateMetadata(key, parseFloat(e.target.value) || 0)}
                          />
                        ) : (
                          <Input
                            value={String(value)}
                            onChange={(e) => updateMetadata(key, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </DrawerSection>
              )}

              {/* Points Preview */}
              <DrawerSection icon={<Calculator className="h-4 w-4" />} label="Points">
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                  <div className="text-center">
                    <p className="text-3xl font-bold font-mono text-primary-600">
                      {selectedSubmission.calculatedPoints.toFixed(2)}
                    </p>
                    <p className="text-sm text-primary-600/80 mt-1">
                      Estimated points (may change on review)
                    </p>
                  </div>
      </div>
              </DrawerSection>
            </DrawerContent>

            <DrawerFooter>
              <Button variant="outline" onClick={() => setDrawerMode('view')}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={saving || !editFormData.title || !editFormData.evidenceValue}>
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </DrawerFooter>
          </>
        )}
      </Drawer>
    </DashboardLayout>
  )
}

export default function SubmissionsPage() {
  return (
    <ProtectedRoute>
      <SubmissionsContent />
    </ProtectedRoute>
  )
}
