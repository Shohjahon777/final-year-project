'use client'

import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
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
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  User,
  Calendar,
  Tag,
  FileCheck,
  MessageSquare,
  Calculator,
  Link as LinkIcon,
  Eye,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { adminApi, AdminSubmission } from '@/lib/api/admin'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

// Mock submissions data
const mockSubmissions: AdminSubmission[] = [
  {
    _id: '1',
    userId: {
      _id: 'u1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@cau.edu',
      facultyRank: 'Associate Professor',
      department: 'Computer Science',
    },
    category: 'research',
    subcategory: 'journal_q1',
    title: 'Machine Learning Applications in Healthcare Diagnostics',
    description: 'Published in Nature Medicine, Impact Factor 82.9',
    evidence: { type: 'link', value: 'https://nature.com/articles/123456' },
    metadata: { journal: 'Nature Medicine', impactFactor: 82.9, authorPosition: 'first' },
    calculatedPoints: 14,
    status: 'pending',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '2',
    userId: {
      _id: 'u2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@cau.edu',
      facultyRank: 'Professor',
      department: 'Computer Science',
    },
    category: 'teaching',
    subcategory: 'course_development',
    title: 'New Course: Advanced Deep Learning',
    description: 'Developed new graduate-level course with complete syllabus and materials',
    evidence: { type: 'file', value: 'course_materials.zip' },
    metadata: { courseCode: 'CS601', creditHours: 3 },
    calculatedPoints: 5,
    status: 'pending',
    submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '3',
    userId: {
      _id: 'u3',
      firstName: 'Robert',
      lastName: 'Johnson',
      email: 'robert.j@cau.edu',
      facultyRank: 'Assistant Professor',
      department: 'Mathematics',
    },
    category: 'admin',
    subcategory: 'committee',
    title: 'Curriculum Committee Chair',
    description: 'Led the department curriculum revision committee for 2024-2025',
    evidence: { type: 'text', value: 'Served as chair for 12 meetings, produced new curriculum proposal' },
    metadata: { complexity: 'major', duration: '1 year' },
    calculatedPoints: 8,
    status: 'approved',
    adminNotes: 'Excellent leadership in curriculum development',
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '4',
    userId: {
      _id: 'u4',
      firstName: 'Emily',
      lastName: 'Brown',
      email: 'emily.b@cau.edu',
      facultyRank: 'Lecturer',
      department: 'Physics',
    },
    category: 'outreach',
    subcategory: 'workshop',
    title: 'High School Physics Workshop',
    description: 'Conducted physics demonstration workshop for local high school students',
    evidence: { type: 'link', value: 'https://physics.cau.edu/events/workshop-2024' },
    metadata: { attendees: 50, duration: '4 hours' },
    calculatedPoints: 2,
    status: 'rejected',
    adminNotes: 'Insufficient documentation of workshop content and outcomes',
    submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '5',
    userId: {
      _id: 'u1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@cau.edu',
      facultyRank: 'Associate Professor',
      department: 'Computer Science',
    },
    category: 'research',
    subcategory: 'conference',
    title: 'IEEE Conference Presentation',
    description: 'Presented paper on Neural Network Optimization at IEEE Conference',
    evidence: { type: 'link', value: 'https://ieeexplore.ieee.org/document/123' },
    metadata: { conference: 'IEEE ICML 2024', type: 'international' },
    calculatedPoints: 6,
    status: 'pending',
    submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
]

// Extended trend data for larger chart (8 weeks)
const trendData = [
  { week: 'Week 1', research: 5, teaching: 3, admin: 2, outreach: 1, total: 11 },
  { week: 'Week 2', research: 8, teaching: 4, admin: 3, outreach: 2, total: 17 },
  { week: 'Week 3', research: 6, teaching: 5, admin: 2, outreach: 3, total: 16 },
  { week: 'Week 4', research: 12, teaching: 6, admin: 4, outreach: 2, total: 24 },
  { week: 'Week 5', research: 9, teaching: 7, admin: 3, outreach: 4, total: 23 },
  { week: 'Week 6', research: 7, teaching: 4, admin: 5, outreach: 2, total: 18 },
  { week: 'Week 7', research: 10, teaching: 8, admin: 4, outreach: 3, total: 25 },
  { week: 'Week 8', research: 11, teaching: 6, admin: 3, outreach: 5, total: 25 },
]

// Category distribution for horizontal bars
const categoryDistribution = [
  { name: 'Research', value: 68, percentage: 45, color: '#3B82F6' },
  { name: 'Teaching', value: 43, percentage: 30, color: '#8B5CF6' },
  { name: 'Admin', value: 26, percentage: 15, color: '#64748B' },
  { name: 'Outreach', value: 22, percentage: 10, color: '#F97316' },
]

// Chart colors
const chartColors = {
  research: '#3B82F6',
  teaching: '#8B5CF6',
  admin: '#64748B',
  outreach: '#F97316',
}

// Flat, subtle category styles
const categoryStyles: Record<string, string> = {
  research: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  teaching: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
  admin: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  outreach: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
}

// Flat, compact status styles
const statusStyles: Record<string, string> = {
  pending: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400',
  approved: 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400',
}

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Custom tooltip for chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="capitalize">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedSubmission, setSelectedSubmission] = useState<AdminSubmission | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [adjustedPoints, setAdjustedPoints] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'all'>('month')
  const { success, error: showError } = useToast()

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const result = await adminApi.getSubmissions({
        status: activeTab === 'all' ? undefined : activeTab,
        category: selectedCategory || undefined,
        page,
        limit: 10,
      })
      setSubmissions(result.submissions)
      setTotalPages(result.pagination.pages)
    } catch (err) {
      const filtered = mockSubmissions.filter((s) => {
        if (activeTab !== 'all' && s.status !== activeTab) return false
        if (selectedCategory && s.category !== selectedCategory) return false
        return true
      })
      setSubmissions(filtered)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [activeTab, selectedCategory, page])

  const filteredSubmissions = submissions.filter((s) => {
    if (!search) return true
    return (
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.userId.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.userId.lastName.toLowerCase().includes(search.toLowerCase())
    )
  })

  // Calculate stats
  const stats = useMemo(() => {
    const pending = mockSubmissions.filter((s) => s.status === 'pending').length
    const approved = mockSubmissions.filter((s) => s.status === 'approved').length
    const rejected = mockSubmissions.filter((s) => s.status === 'rejected').length
    const totalPoints = mockSubmissions
      .filter((s) => s.status === 'approved')
      .reduce((sum, s) => sum + (s.adjustedPoints ?? s.calculatedPoints), 0)
    
    return { total: mockSubmissions.length, pending, approved, rejected, totalPoints }
  }, [])

  const statusCounts = {
    all: mockSubmissions.length,
    pending: stats.pending,
    approved: stats.approved,
    rejected: stats.rejected,
  }

  const openSubmissionDrawer = (submission: AdminSubmission) => {
    setSelectedSubmission(submission)
    setReviewNotes('')
    setAdjustedPoints(null)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setSelectedSubmission(null)
    setReviewNotes('')
    setAdjustedPoints(null)
  }

  const handleApprove = async (submission?: AdminSubmission, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const target = submission || selectedSubmission
    if (!target) return
    setActionLoading(true)
    try {
      await adminApi.approveSubmission(target._id, {
        notes: reviewNotes || undefined,
        adjustedPoints: adjustedPoints ?? undefined,
      })
      success('Submission approved', 'The submission has been approved successfully')
      closeDrawer()
      fetchSubmissions()
    } catch (err) {
      showError('Failed to approve', 'Could not approve the submission. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (submission?: AdminSubmission, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const target = submission || selectedSubmission
    if (!target) return
    
    if (!reviewNotes && !drawerOpen) {
      openSubmissionDrawer(target)
      return
    }
    
    if (!reviewNotes) {
      showError('Notes required', 'Please add notes explaining the rejection.')
      return
    }
    
    setActionLoading(true)
    try {
      await adminApi.rejectSubmission(target._id, reviewNotes)
      success('Submission rejected', 'The submission has been rejected')
      closeDrawer()
      fetchSubmissions()
    } catch (err) {
      showError('Failed to reject', 'Could not reject the submission. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Submission Review</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Review and approve faculty activity submissions
        </p>
      </div>

      {/* Metrics Bar - Single Row, 4 Columns */}
      <div className="border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="grid grid-cols-4 divide-x divide-gray-200 dark:divide-gray-800">
          {/* Total */}
          <div className="px-6 py-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Submissions</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-50">{stats.total}</span>
              <span className="flex items-center text-xs font-medium text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                12%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">This month</p>
          </div>

          {/* Pending */}
          <div className="px-6 py-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Pending Review</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-orange-600">{stats.pending}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Awaiting action</p>
          </div>

          {/* Approved */}
          <div className="px-6 py-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Approved</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">{stats.approved}</span>
              <span className="flex items-center text-xs font-medium text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                8%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">This month</p>
          </div>

          {/* Points Awarded */}
          <div className="px-6 py-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Points Awarded</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600 font-mono">{stats.totalPoints}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Total approved</p>
          </div>
        </div>
      </div>

      {/* Main Chart Section - Split Layout */}
      <div className="border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-800">
          {/* Trend Chart - 2/3 width */}
          <div className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">Submission Activity</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last 8 weeks by category</p>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                {(['week', 'month', 'all'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setChartPeriod(period)}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize',
                      chartPeriod === period
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="researchGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.research} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={chartColors.research} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="teachingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.teaching} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={chartColors.teaching} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.admin} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={chartColors.admin} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="outreachGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.outreach} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={chartColors.outreach} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis 
                    dataKey="week" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="research" stroke={chartColors.research} strokeWidth={2} fill="url(#researchGrad)" />
                  <Area type="monotone" dataKey="teaching" stroke={chartColors.teaching} strokeWidth={2} fill="url(#teachingGrad)" />
                  <Area type="monotone" dataKey="admin" stroke={chartColors.admin} strokeWidth={2} fill="url(#adminGrad)" />
                  <Area type="monotone" dataKey="outreach" stroke={chartColors.outreach} strokeWidth={2} fill="url(#outreachGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-3">
              {Object.entries(chartColors).map(([key, color]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{key}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown - 1/3 width */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">By Category</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Distribution this period</p>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="space-y-3">
              {categoryDistribution.map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{cat.value} ({cat.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Total this period</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">159 submissions</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Avg. per week</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">~20</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  setPage(1)
                }}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  activeTab === tab.key
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'ml-1.5 px-1.5 py-0.5 rounded text-xs',
                    activeTab === tab.key
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500'
                  )}
                >
                  {statusCounts[tab.key as keyof typeof statusCounts]}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 w-48 text-sm bg-white dark:bg-gray-900"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setPage(1)
              }}
              className="h-8 px-2.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300"
            >
              <option value="">All Categories</option>
              <option value="research">Research</option>
              <option value="teaching">Teaching</option>
              <option value="admin">Administrative</option>
              <option value="outreach">Outreach</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="px-6 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80 flex-shrink-0">
        <div className="flex items-center text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="flex-1">Submission</div>
          <div className="w-24 text-right">Points</div>
          <div className="w-32 text-right">Actions</div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400">
            <FileText className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No submissions found</p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => (
            <div
              key={submission._id}
              className={cn(
                'group px-6 py-4 cursor-pointer transition-colors',
                hoveredRow === submission._id ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900'
              )}
              onMouseEnter={() => setHoveredRow(submission._id)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => openSubmissionDrawer(submission)}
            >
              <div className="flex items-start gap-4">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  {/* Row 1: Tags + Title */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium rounded', categoryStyles[submission.category])}>
                      {submission.category}
                    </span>
                    <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium rounded', statusStyles[submission.status])}>
                      {submission.status === 'pending' && <Clock className="h-3 w-3" />}
                      {submission.status === 'approved' && <CheckCircle className="h-3 w-3" />}
                      {submission.status === 'rejected' && <XCircle className="h-3 w-3" />}
                      {submission.status}
                    </span>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">{submission.title}</h3>
                  </div>

                  {/* Row 2: Description */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-1.5">
                    {submission.description || submission.evidence.value}
                  </p>

                  {/* Row 3: Faculty Info */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {submission.userId.firstName} {submission.userId.lastName}
                    </span>
                    <span>•</span>
                    <span>{submission.userId.facultyRank}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(submission.submittedAt)}</span>
                  </div>
                </div>

                {/* Points */}
                <div className="w-24 text-right">
                  <span className="font-mono text-lg font-semibold text-blue-600 dark:text-blue-400">
                    +{submission.adjustedPoints ?? submission.calculatedPoints}
                  </span>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">points</p>
                </div>

                {/* Actions */}
                <div className="w-32 flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={(e) => { e.stopPropagation(); openSubmissionDrawer(submission) }}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View
                  </Button>

                  {submission.status === 'pending' && (
                    <div className={cn('flex items-center gap-1 transition-opacity', hoveredRow === submission._id ? 'opacity-100' : 'opacity-0')}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-500 dark:hover:text-green-400 dark:hover:bg-green-950/50"
                        onClick={(e) => handleApprove(submission, e)}
                        title="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:text-red-400 dark:hover:bg-red-950/50"
                        onClick={(e) => handleReject(submission, e)}
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Prev
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        {selectedSubmission && (
          <>
            <DrawerHeader breadcrumb="Submissions / Review">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('px-2 py-0.5 text-xs font-medium rounded', categoryStyles[selectedSubmission.category])}>
                  {selectedSubmission.category}
                </span>
                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded', statusStyles[selectedSubmission.status])}>
                  {selectedSubmission.status === 'pending' && <Clock className="h-3 w-3" />}
                  {selectedSubmission.status === 'approved' && <CheckCircle className="h-3 w-3" />}
                  {selectedSubmission.status === 'rejected' && <XCircle className="h-3 w-3" />}
                  {selectedSubmission.status}
                </span>
              </div>
              <DrawerTitle>{selectedSubmission.title}</DrawerTitle>
              <DrawerDescription>{selectedSubmission.subcategory.replace(/_/g, ' ')}</DrawerDescription>
            </DrawerHeader>

            <DrawerContent className="space-y-6">
              {/* Key Information */}
              <div className="space-y-1 border-b border-gray-200 dark:border-gray-800 pb-4">
                <DrawerInfoRow icon={<Clock className="h-4 w-4" />} label="Submitted">
                  {formatDate(selectedSubmission.submittedAt)}
                </DrawerInfoRow>
                <DrawerInfoRow icon={<User className="h-4 w-4" />} label="Faculty">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 text-xs font-medium">
                      {selectedSubmission.userId.firstName[0]}{selectedSubmission.userId.lastName[0]}
                    </div>
                    <span>{selectedSubmission.userId.firstName} {selectedSubmission.userId.lastName}</span>
                  </div>
                </DrawerInfoRow>
                <DrawerInfoRow icon={<Tag className="h-4 w-4" />} label="Rank">{selectedSubmission.userId.facultyRank}</DrawerInfoRow>
                <DrawerInfoRow icon={<FileCheck className="h-4 w-4" />} label="Department">{selectedSubmission.userId.department}</DrawerInfoRow>
              </div>

              {/* Description */}
              <DrawerSection icon={<MessageSquare className="h-4 w-4" />} label="Description">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                  {selectedSubmission.description}
                </div>
              </DrawerSection>

              {/* Evidence */}
              <DrawerSection icon={<LinkIcon className="h-4 w-4" />} label="Evidence">
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  {selectedSubmission.evidence.type === 'link' ? (
                    <a href={selectedSubmission.evidence.value} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm">
                      <ExternalLink className="h-4 w-4" />
                      <span className="truncate">{selectedSubmission.evidence.value}</span>
                    </a>
                  ) : selectedSubmission.evidence.type === 'file' ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{selectedSubmission.evidence.value}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary-600">Download</Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedSubmission.evidence.value}</p>
                  )}
                </div>
              </DrawerSection>

              {/* Metadata */}
              {selectedSubmission.metadata && Object.keys(selectedSubmission.metadata).length > 0 && (
                <DrawerSection icon={<FileText className="h-4 w-4" />} label="Additional Details">
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(selectedSubmission.metadata).map(([key, value]) => (
                      <div key={key} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </DrawerSection>
              )}

              {/* Points */}
              <DrawerSection icon={<Calculator className="h-4 w-4" />} label="Points">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Calculated Points</p>
                      <p className="font-mono text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">+{selectedSubmission.calculatedPoints}</p>
                    </div>
                    {selectedSubmission.status === 'pending' && (
                      <div className="text-right">
                        <label className="text-sm text-gray-600 dark:text-gray-400">Adjust Points</label>
                        <Input
                          type="number"
                          placeholder={selectedSubmission.calculatedPoints.toString()}
                          value={adjustedPoints ?? ''}
                          onChange={(e) => setAdjustedPoints(e.target.value ? parseInt(e.target.value) : null)}
                          className="w-24 mt-1 font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </DrawerSection>

              {/* Review Notes */}
              {selectedSubmission.status === 'pending' ? (
                <DrawerSection icon={<MessageSquare className="h-4 w-4" />} label="Review Notes">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Notes are required for rejection</p>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes about this submission..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 placeholder:text-gray-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </DrawerSection>
              ) : selectedSubmission.adminNotes ? (
                <DrawerSection icon={<MessageSquare className="h-4 w-4" />} label="Admin Notes">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                    {selectedSubmission.adminNotes}
                  </div>
                </DrawerSection>
              ) : null}

              {/* Timeline */}
              {selectedSubmission.reviewedAt && (
                <DrawerSection icon={<Calendar className="h-4 w-4" />} label="Timeline">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                      <span className="text-gray-500">Submitted</span>
                      <span className="text-gray-700 dark:text-gray-300">{formatDate(selectedSubmission.submittedAt)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className={cn('h-2 w-2 rounded-full', selectedSubmission.status === 'approved' ? 'bg-green-500' : 'bg-red-500')} />
                      <span className="text-gray-500">{selectedSubmission.status === 'approved' ? 'Approved' : 'Rejected'}</span>
                      <span className="text-gray-700 dark:text-gray-300">{formatDate(selectedSubmission.reviewedAt)}</span>
                    </div>
                  </div>
                </DrawerSection>
              )}
            </DrawerContent>

            {/* Footer */}
            {selectedSubmission.status === 'pending' ? (
              <DrawerFooter>
                <Button variant="outline" onClick={closeDrawer} className="h-9">Cancel</Button>
                <Button
                  variant="outline"
                  className="h-9 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:border-red-900 dark:hover:bg-red-950/50"
                  onClick={() => handleReject()}
                  disabled={!reviewNotes || actionLoading}
                >
                  {actionLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" /> : <><XCircle className="h-4 w-4 mr-2" />Reject</>}
                </Button>
                <Button className="h-9 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove()} disabled={actionLoading}>
                  {actionLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><CheckCircle className="h-4 w-4 mr-2" />Approve</>}
                </Button>
              </DrawerFooter>
            ) : (
              <DrawerFooter>
                <Button variant="outline" onClick={closeDrawer} className="h-9">Close</Button>
              </DrawerFooter>
            )}
          </>
        )}
      </Drawer>
    </div>
  )
}
