'use client'

import { useEffect, useState } from 'react'
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
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  FileText,
  Calculator,
  Link as LinkIcon,
  MessageSquare,
  Tag,
  TrendingDown,
  Clock,
} from 'lucide-react'
import { adminApi, Penalty, CreatePenaltyData, Faculty } from '@/lib/api/admin'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

// Mock penalties data
const mockPenalties: Penalty[] = [
  {
    _id: '1',
    userId: { _id: 'u1', firstName: 'John', lastName: 'Doe', email: 'john.doe@cau.edu' },
    type: 'meeting',
    description: 'Missed department faculty meeting on March 15, 2024',
    points: -2,
    appliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    academicYear: '2024-2025',
    appliedBy: { _id: 'a1', firstName: 'Admin', lastName: 'User' },
  },
  {
    _id: '2',
    userId: { _id: 'u3', firstName: 'Robert', lastName: 'Johnson', email: 'robert.j@cau.edu' },
    type: 'deadline',
    description: 'Late submission of annual performance report',
    points: -3,
    appliedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    academicYear: '2024-2025',
    appliedBy: { _id: 'a1', firstName: 'Admin', lastName: 'User' },
  },
  {
    _id: '3',
    userId: { _id: 'u4', firstName: 'Emily', lastName: 'Brown', email: 'emily.b@cau.edu' },
    type: 'meeting',
    description: 'Absent from curriculum committee meeting',
    points: -2,
    appliedAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    academicYear: '2024-2025',
    appliedBy: { _id: 'a1', firstName: 'Admin', lastName: 'User' },
  },
  {
    _id: '4',
    userId: { _id: 'u5', firstName: 'Michael', lastName: 'Davis', email: 'michael.d@cau.edu' },
    type: 'deadline',
    description: 'Late grade submission for Fall 2024 semester',
    points: -3,
    appliedAt: new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(),
    academicYear: '2024-2025',
    appliedBy: { _id: 'a1', firstName: 'Admin', lastName: 'User' },
  },
]

const mockFacultyList: Pick<Faculty, '_id' | 'firstName' | 'lastName' | 'email'>[] = [
  { _id: 'u1', firstName: 'John', lastName: 'Doe', email: 'john.doe@cau.edu' },
  { _id: 'u2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@cau.edu' },
  { _id: 'u3', firstName: 'Robert', lastName: 'Johnson', email: 'robert.j@cau.edu' },
  { _id: 'u4', firstName: 'Emily', lastName: 'Brown', email: 'emily.b@cau.edu' },
  { _id: 'u5', firstName: 'Michael', lastName: 'Davis', email: 'michael.d@cau.edu' },
]

const penaltyTypes = [
  { value: 'meeting', label: 'Meeting Absence', points: -2, description: 'Missed required faculty/committee meetings' },
  { value: 'deadline', label: 'Late Submission/Deadline', points: -3, description: 'Late grade submission, report deadlines, etc.' },
  { value: 'academic_dishonesty', label: 'Academic Dishonesty', points: -10, description: 'Violations of academic integrity policies' },
]

const typeColors: Record<string, string> = {
  meeting: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
  deadline: 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400',
  academic_dishonesty: 'bg-danger-100 text-danger-800 dark:bg-danger-900/50 dark:text-danger-300',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateFull(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminPenaltiesPage() {
  const [penalties, setPenalties] = useState<Penalty[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionLoading, setActionLoading] = useState(false)
  const [facultyList, setFacultyList] = useState<Pick<Faculty, '_id' | 'firstName' | 'lastName' | 'email'>[]>([])

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null)

  const [formData, setFormData] = useState<CreatePenaltyData>({
    userId: '',
    type: 'meeting',
    description: '',
    points: -2,
  })

  const { success, error: showError } = useToast()

  const fetchPenalties = async () => {
    setLoading(true)
    try {
      const result = await adminApi.getPenalties({
        type: selectedType || undefined,
        page,
        limit: 10,
      })
      setPenalties(result.penalties)
      setTotalPages(result.pagination.pages)
    } catch {
      const filtered = mockPenalties.filter((p) => !selectedType || p.type === selectedType)
      setPenalties(filtered)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const fetchFacultyList = async () => {
    try {
      const result = await adminApi.getFaculty({ limit: 100 })
      setFacultyList(result.faculty)
    } catch {
      setFacultyList(mockFacultyList)
    }
  }

  useEffect(() => {
    fetchPenalties()
    fetchFacultyList()
  }, [selectedType, page])

  const filteredPenalties = penalties.filter((p) => {
    if (!search) return true
    return (
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.userId.firstName.toLowerCase().includes(search.toLowerCase()) ||
      p.userId.lastName.toLowerCase().includes(search.toLowerCase())
    )
  })

  const openCreateDrawer = () => {
    setSelectedPenalty(null)
    setDrawerMode('create')
    setFormData({ userId: '', type: 'meeting', description: '', points: -2 })
    setDrawerOpen(true)
  }

  const openEditDrawer = (penalty: Penalty) => {
    setSelectedPenalty(penalty)
    setDrawerMode('edit')
    setFormData({
      userId: penalty.userId._id,
      type: penalty.type,
      description: penalty.description,
      points: Math.abs(penalty.points),
      evidence: penalty.evidence,
    })
    setDrawerOpen(true)
  }

  const openViewDrawer = (penalty: Penalty) => {
    setSelectedPenalty(penalty)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setSelectedPenalty(null)
    setFormData({ userId: '', type: 'meeting', description: '', points: -2 })
  }

  const handleTypeChange = (type: 'meeting' | 'deadline' | 'academic_dishonesty') => {
    const penaltyType = penaltyTypes.find((pt) => pt.value === type)
    setFormData((prev) => ({
      ...prev,
      type,
      points: Math.abs(penaltyType?.points || -2),
    }))
  }

  const handleSubmit = async () => {
    if (!formData.userId || !formData.description) {
      showError('Validation Error', 'Please fill in all required fields')
      return
    }
    setActionLoading(true)
    try {
      if (drawerMode === 'edit' && selectedPenalty) {
        await adminApi.updatePenalty(selectedPenalty._id, {
          description: formData.description,
          points: formData.points,
          evidence: formData.evidence,
        })
        success('Penalty Updated', 'The penalty has been updated successfully')
      } else {
        await adminApi.createPenalty(formData)
        success('Penalty Applied', 'The penalty has been applied to the faculty member')
      }
      closeDrawer()
      fetchPenalties()
    } catch {
      showError('Error', 'Failed to save the penalty. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (penaltyId: string) => {
    if (!confirm('Are you sure you want to delete this penalty?')) return
    setActionLoading(true)
    try {
      await adminApi.deletePenalty(penaltyId)
      success('Penalty Deleted', 'The penalty has been removed')
      closeDrawer()
      fetchPenalties()
    } catch {
      showError('Error', 'Failed to delete the penalty')
    } finally {
      setActionLoading(false)
    }
  }

  const totalDeductions = penalties.reduce((sum, p) => sum + p.points, 0)
  const meetingCount = penalties.filter(p => p.type === 'meeting').length
  const deadlineCount = penalties.filter(p => p.type === 'deadline').length

  const getTypeLabel = (type: string) => penaltyTypes.find((t) => t.value === type)?.label || type

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-base font-bold text-gray-900 dark:text-gray-50 tracking-tight">Penalties</h1>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">2024-2025 • Real-time monitoring</p>
        </div>
        <Button size="sm" onClick={openCreateDrawer} className="h-7">
          <Plus className="h-3 w-3 mr-1" />
          <span className="text-[11px]">Apply</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {/* Total */}
        <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="h-6 w-6 rounded bg-gray-100 dark:bg-slate-700/50 flex items-center justify-center border border-gray-200 dark:border-slate-600/50">
              <AlertTriangle className="h-3 w-3 text-gray-500 dark:text-slate-400" strokeWidth={1.5} />
            </div>
            <div className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400">
              Count
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{penalties.length}</div>
          <div className="text-[9px] text-gray-500 dark:text-slate-400 uppercase tracking-wide font-medium">Penalties</div>
        </div>

        {/* Deductions */}
        <div className="relative overflow-hidden rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-950/25 p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="h-6 w-6 rounded bg-red-100 dark:bg-red-500/10 flex items-center justify-center border border-red-200 dark:border-red-500/20">
              <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 tracking-tight">{totalDeductions}</div>
            <div className="text-[10px] text-red-500 dark:text-red-400/60">pts</div>
          </div>
          <div className="text-[9px] text-red-500 dark:text-red-400/60 uppercase tracking-wide font-medium">Deductions</div>
        </div>

        {/* Meeting */}
        <div className="relative overflow-hidden rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-950/25 p-2.5">
          <div className="h-6 w-6 rounded bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center border border-amber-200 dark:border-amber-500/20 mb-1.5">
            <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">{meetingCount}</div>
          <div className="text-[9px] text-amber-500 dark:text-amber-400/60 uppercase tracking-wide font-medium">Meetings</div>
          <div className="absolute top-2.5 right-2.5">
            <svg className="w-8 h-8 transform -rotate-90">
              <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-200 dark:text-slate-800/50" />
              <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={`${(meetingCount / (penalties.length || 1)) * 75} 75`} className="text-amber-500 dark:text-amber-500/40" />
            </svg>
          </div>
        </div>

        {/* Deadline */}
        <div className="relative overflow-hidden rounded-lg border border-orange-200 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-950/25 p-2.5">
          <div className="h-6 w-6 rounded bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center border border-orange-200 dark:border-orange-500/20 mb-1.5">
            <Calendar className="h-3 w-3 text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 tracking-tight">{deadlineCount}</div>
          <div className="text-[9px] text-orange-500 dark:text-orange-400/60 uppercase tracking-wide font-medium">Deadlines</div>
          <div className="absolute top-2.5 right-2.5">
            <svg className="w-8 h-8 transform -rotate-90">
              <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-200 dark:text-slate-800/50" />
              <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={`${(deadlineCount / (penalties.length || 1)) * 75} 75`} className="text-orange-500 dark:text-orange-500/40" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-gray-200 dark:border-slate-800/50 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
        {/* Filter Bar */}
        <div className="border-b border-gray-200 dark:border-slate-800/50 bg-gray-50/80 dark:bg-slate-900/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 dark:text-slate-500" strokeWidth={1.5} />
              <Input
                placeholder="Search penalties, faculty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-7 bg-white dark:bg-slate-800/30 border-gray-300 dark:border-slate-700/50 text-gray-900 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 text-[11px]"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setPage(1) }}
              className="h-7 px-2 rounded bg-white dark:bg-slate-800/30 border border-gray-300 dark:border-slate-700/50 text-gray-900 dark:text-slate-200 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {penaltyTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <div className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700/50 text-[9px] text-gray-500 dark:text-slate-400 font-mono">
              {filteredPenalties.length}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 dark:border-slate-800 border-t-blue-500 mx-auto" />
              <p className="mt-2 text-[10px] text-gray-500 dark:text-slate-500">Loading...</p>
            </div>
          </div>
        ) : filteredPenalties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-10 w-10 text-gray-300 dark:text-slate-700 mb-2" />
            <h3 className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-0.5">No penalties found</h3>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">Adjust filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800/50">
            {filteredPenalties.map((penalty) => {
              const absPoints = Math.abs(penalty.points)
              const severityColor = absPoints >= 10 ? 'red' : absPoints >= 5 ? 'orange' : 'amber'

              return (
                <div
                  key={penalty._id}
                  className="group flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-all duration-100 cursor-pointer"
                  onClick={() => openViewDrawer(penalty)}
                >
                  {/* User */}
                  <div className="flex items-center gap-2.5 w-52">
                    <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-gray-600 dark:text-slate-300 font-semibold text-[11px] border border-gray-200 dark:border-slate-700/50 flex-shrink-0">
                      {penalty.userId.firstName[0]}{penalty.userId.lastName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-gray-900 dark:text-white truncate tracking-tight">
                        {penalty.userId.firstName} {penalty.userId.lastName}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-slate-500 truncate font-mono">
                        {penalty.userId.email}
                      </div>
                    </div>
                  </div>

                  {/* Infraction */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider',
                        penalty.type === 'meeting' && 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',
                        penalty.type === 'deadline' && 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20',
                        penalty.type === 'academic_dishonesty' && 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                      )}>
                        {getTypeLabel(penalty.type)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-700 dark:text-slate-300 truncate">{penalty.description}</div>
                  </div>

                  {/* Score */}
                  <div className={cn(
                    'px-3 py-1.5 rounded-lg font-bold text-sm border shadow-sm flex-shrink-0',
                    severityColor === 'red' && 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30',
                    severityColor === 'orange' && 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30',
                    severityColor === 'amber' && 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                  )}>
                    {penalty.points}
                  </div>

                  {/* Date */}
                  <div className="text-[11px] text-gray-400 dark:text-slate-500 font-mono w-24 flex-shrink-0">
                    {formatDate(penalty.appliedAt)}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-1.5 w-16 flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                    <span className="text-[10px] text-red-500 dark:text-red-400 font-medium uppercase tracking-wide">Live</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditDrawer(penalty) }}
                      className="h-7 w-7 rounded-md flex items-center justify-center bg-gray-100 dark:bg-slate-800/50 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-gray-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/30 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-100"
                    >
                      <Edit2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(penalty._id) }}
                      className="h-7 w-7 rounded-md flex items-center justify-center bg-gray-100 dark:bg-slate-800/50 hover:bg-red-100 dark:hover:bg-red-500/20 border border-gray-200 dark:border-slate-700/50 hover:border-red-300 dark:hover:border-red-500/30 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-slate-800/50">
          <p className="text-[10px] text-gray-500 dark:text-slate-500 font-mono">Page {page} / {totalPages}</p>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-6 px-2 rounded flex items-center gap-1 bg-gray-100 dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700/50 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-medium transition-all"
            >
              <ChevronLeft className="h-3 w-3" strokeWidth={1.5} />
              Prev
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-6 px-2 rounded flex items-center gap-1 bg-gray-100 dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700/50 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-medium transition-all"
            >
              Next
              <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        {drawerMode === 'view' && selectedPenalty ? (
          <>
            <DrawerHeader breadcrumb="Penalties / View">
              <div className="flex items-center gap-3 mb-2">
                <span className={cn('px-2.5 py-1 rounded text-xs font-medium', typeColors[selectedPenalty.type])}>
                  {getTypeLabel(selectedPenalty.type)}
                </span>
              </div>
              <DrawerTitle>Penalty Details</DrawerTitle>
              <DrawerDescription>Applied on {formatDateFull(selectedPenalty.appliedAt)}</DrawerDescription>
            </DrawerHeader>

            <DrawerContent className="space-y-6">
              <DrawerSection icon={<User className="h-4 w-4" />} label="Faculty Member">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-medium">
                    {selectedPenalty.userId.firstName[0]}{selectedPenalty.userId.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-50">
                      {selectedPenalty.userId.firstName} {selectedPenalty.userId.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{selectedPenalty.userId.email}</p>
                  </div>
                </div>
              </DrawerSection>

              <DrawerSection icon={<MessageSquare className="h-4 w-4" />} label="Description">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                  {selectedPenalty.description}
                </div>
              </DrawerSection>

              <DrawerSection icon={<Calculator className="h-4 w-4" />} label="Points Deduction">
                <div className="p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg border border-danger-200 dark:border-danger-800">
                  <p className="text-3xl font-bold text-danger-600">{selectedPenalty.points}</p>
                  <p className="text-sm text-danger-600/80 mt-1">points deducted from final score</p>
                </div>
              </DrawerSection>

              {selectedPenalty.evidence && (
                <DrawerSection icon={<LinkIcon className="h-4 w-4" />} label="Evidence">
                  <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <a href={selectedPenalty.evidence} target="_blank" rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      {selectedPenalty.evidence}
                    </a>
                  </div>
                </DrawerSection>
              )}

              <DrawerSection icon={<FileText className="h-4 w-4" />} label="Details">
                <div className="space-y-1">
                  <DrawerInfoRow icon={<Calendar className="h-4 w-4" />} label="Applied On">
                    {formatDateFull(selectedPenalty.appliedAt)}
                  </DrawerInfoRow>
                  <DrawerInfoRow icon={<Tag className="h-4 w-4" />} label="Academic Year">
                    {selectedPenalty.academicYear}
                  </DrawerInfoRow>
                  <DrawerInfoRow icon={<User className="h-4 w-4" />} label="Applied By">
                    {selectedPenalty.appliedBy.firstName} {selectedPenalty.appliedBy.lastName}
                  </DrawerInfoRow>
                </div>
              </DrawerSection>
            </DrawerContent>

            <DrawerFooter>
              <Button variant="outline" onClick={closeDrawer}>Close</Button>
              <Button variant="outline" onClick={() => {
                setDrawerMode('edit')
                setFormData({
                  userId: selectedPenalty.userId._id,
                  type: selectedPenalty.type,
                  description: selectedPenalty.description,
                  points: Math.abs(selectedPenalty.points),
                  evidence: selectedPenalty.evidence,
                })
              }}>
                <Edit2 className="h-4 w-4 mr-2" />Edit
              </Button>
              <Button variant="danger" onClick={() => handleDelete(selectedPenalty._id)} disabled={actionLoading}>
                <Trash2 className="h-4 w-4 mr-2" />Delete
              </Button>
            </DrawerFooter>
          </>
        ) : (
          <>
            <DrawerHeader breadcrumb={`Penalties / ${drawerMode === 'create' ? 'New' : 'Edit'}`}>
              <DrawerTitle>{drawerMode === 'create' ? 'Apply New Penalty' : 'Edit Penalty'}</DrawerTitle>
              <DrawerDescription>
                {drawerMode === 'create' ? 'Apply a penalty deduction to a faculty member' : 'Update the penalty details'}
              </DrawerDescription>
            </DrawerHeader>

            <DrawerContent className="space-y-6">
              <DrawerSection icon={<User className="h-4 w-4" />} label="Faculty Member">
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, userId: e.target.value }))}
                  disabled={drawerMode === 'edit'}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm dark:border-gray-700 dark:bg-gray-900 disabled:opacity-50"
                >
                  <option value="">Select faculty member...</option>
                  {facultyList.map((f) => (
                    <option key={f._id} value={f._id}>{f.firstName} {f.lastName} ({f.email})</option>
                  ))}
                </select>
                {!formData.userId && <p className="text-xs text-danger-500 mt-1">Required</p>}
              </DrawerSection>

              <DrawerSection icon={<Tag className="h-4 w-4" />} label="Penalty Type">
                <div className="space-y-2">
                  {penaltyTypes.map((type) => (
                    <label key={type.value} className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      formData.type === type.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}>
                      <input type="radio" name="penaltyType" value={type.value} checked={formData.type === type.value}
                        onChange={() => handleTypeChange(type.value as any)} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-gray-50">{type.label}</span>
                          <span className="text-sm font-bold text-danger-600">{type.points} pts</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </DrawerSection>

              <DrawerSection icon={<MessageSquare className="h-4 w-4" />} label="Description">
                <textarea value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the reason for this penalty..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 placeholder:text-gray-400 text-sm resize-none" />
                {!formData.description && <p className="text-xs text-danger-500 mt-1">Required</p>}
              </DrawerSection>

              <DrawerSection icon={<Calculator className="h-4 w-4" />} label="Points Deduction">
                <div className="flex items-center gap-4">
                  <Input type="number" value={formData.points}
                    onChange={(e) => setFormData((prev) => ({ ...prev, points: e.target.value === '' ? 0 : parseInt(e.target.value) }))}
                    className="w-24" min={1} />
                  <div className="flex-1">
                    <div className="p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg border border-danger-200 dark:border-danger-800">
                      <p className="text-sm text-danger-600">
                        Will deduct <strong>{formData.points}</strong> points from the faculty member's score
                      </p>
                    </div>
                  </div>
                </div>
              </DrawerSection>

              <DrawerSection icon={<LinkIcon className="h-4 w-4" />} label="Evidence (Optional)">
                <Input value={formData.evidence || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, evidence: e.target.value }))}
                  placeholder="Link to supporting evidence..." />
                <p className="text-xs text-gray-500 mt-1">Provide a link to any supporting documentation</p>
              </DrawerSection>
            </DrawerContent>

            <DrawerFooter>
              <Button variant="outline" onClick={closeDrawer}>Cancel</Button>
              <Button variant="danger" onClick={handleSubmit}
                disabled={actionLoading || !formData.userId || !formData.description}>
                {actionLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : drawerMode === 'edit' ? 'Update Penalty' : (
                  <><AlertTriangle className="h-4 w-4 mr-2" />Apply Penalty</>
                )}
              </Button>
            </DrawerFooter>
          </>
        )}
      </Drawer>
    </div>
  )
}
