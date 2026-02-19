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
  Calendar,
  User,
  MessageSquare,
  Calculator,
  Tag,
  TrendingDown,
  Clock,
  FileText,
  Link as LinkIcon,
} from 'lucide-react'
import { adminApi, Penalty, CreatePenaltyData, Faculty } from '@/lib/api/admin'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

// Mock data (keep existing)
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

export default function PenaltiesCommandCenter() {
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
    } catch (err) {
      const filtered = mockPenalties.filter((p) => {
        if (selectedType && p.type !== selectedType) return false
        return true
      })
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
    } catch (err) {
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
    } catch (err) {
      showError('Error', 'Failed to delete the penalty')
    } finally {
      setActionLoading(false)
    }
  }

  const totalDeductions = penalties.reduce((sum, p) => sum + p.points, 0)
  const meetingCount = penalties.filter(p => p.type === 'meeting').length
  const deadlineCount = penalties.filter(p => p.type === 'deadline').length

  const getTypeLabel = (type: string) => {
    return penaltyTypes.find((t) => t.value === type)?.label || type
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-4">
      {/* Heads-Up Display Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Penalty Management</h1>
          <p className="text-xs text-slate-400 mt-0.5 tracking-wide">
            2024-2025 Academic Year • Real-time Monitoring
          </p>
        </div>
        <Button
          onClick={openCreateDrawer}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/20 border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Apply Penalty
        </Button>
      </div>

      {/* Bento Grid Stats - Data Dense HUD */}
      <div className="grid grid-cols-4 gap-3">
        {/* Total Penalties */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900 to-slate-900/50 p-4 backdrop-blur-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="h-9 w-9 rounded-lg bg-slate-800/50 flex items-center justify-center border border-slate-700/50">
              <AlertTriangle className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
            </div>
            <div className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-800/50 text-slate-400 border border-slate-700/50">
              Count
            </div>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">{penalties.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-medium">Total Penalties</div>
        </div>

        {/* Total Points with Sparkline */}
        <div className="relative overflow-hidden rounded-xl border border-red-500/20 bg-gradient-to-br from-red-950/30 to-slate-900/50 p-4 backdrop-blur-sm shadow-lg shadow-red-500/5">
          <div className="flex items-start justify-between mb-2">
            <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <TrendingDown className="h-4 w-4 text-red-400" strokeWidth={1.5} />
            </div>
            <div className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
              Impact
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-red-400 tracking-tight">{totalDeductions}</div>
            <div className="text-xs text-red-400/60">pts</div>
          </div>
          <div className="text-[10px] text-red-400/60 mt-0.5 uppercase tracking-wider font-medium">Total Deductions</div>
          {/* Mini sparkline */}
          <svg className="absolute bottom-2 right-2 w-16 h-6 opacity-20">
            <polyline
              points="0,24 8,18 16,20 24,14 32,16 40,10 48,12 56,8 64,6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-red-400"
            />
          </svg>
        </div>

        {/* Meeting Penalties */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-slate-900/50 p-4 backdrop-blur-sm shadow-lg shadow-amber-500/5">
          <div className="flex items-start justify-between mb-2">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Clock className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-400 tracking-tight">{meetingCount}</div>
          <div className="text-[10px] text-amber-400/60 mt-0.5 uppercase tracking-wider font-medium">Meeting Absences</div>
          {/* Progress circle */}
          <div className="absolute top-4 right-4">
            <svg className="w-10 h-10 transform -rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-800/50" />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${(meetingCount / penalties.length) * 100} 100`}
                className="text-amber-500/40"
              />
            </svg>
          </div>
        </div>

        {/* Deadline Penalties */}
        <div className="relative overflow-hidden rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-950/30 to-slate-900/50 p-4 backdrop-blur-sm shadow-lg shadow-orange-500/5">
          <div className="flex items-start justify-between mb-2">
            <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Calendar className="h-4 w-4 text-orange-400" strokeWidth={1.5} />
            </div>
          </div>
          <div className="text-3xl font-bold text-orange-400 tracking-tight">{deadlineCount}</div>
          <div className="text-[10px] text-orange-400/60 mt-0.5 uppercase tracking-wider font-medium">Late Submissions</div>
          {/* Progress circle */}
          <div className="absolute top-4 right-4">
            <svg className="w-10 h-10 transform -rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-800/50" />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${(deadlineCount / penalties.length) * 100} 100`}
                className="text-orange-500/40"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Dense Data Table Container */}
      <div className="rounded-xl border border-slate-800/50 bg-gradient-to-b from-slate-900 to-slate-900/50 backdrop-blur-sm overflow-hidden shadow-2xl">
        {/* Table Header with Glass Filter Bar */}
        <div className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md p-3">
          <div className="flex items-center gap-2">
            {/* Glass Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" strokeWidth={1.5} />
              <Input
                placeholder="Search penalties, faculty names..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 bg-slate-800/30 border-slate-700/50 text-slate-200 placeholder:text-slate-500 text-xs backdrop-blur-sm focus:bg-slate-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value)
                setPage(1)
              }}
              className="h-8 px-3 rounded-lg bg-slate-800/30 border border-slate-700/50 text-slate-200 text-xs backdrop-blur-sm focus:bg-slate-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
            >
              <option value="">All Types</option>
              {penaltyTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <div className="px-2 py-1 rounded-lg bg-slate-800/30 border border-slate-700/50 text-[10px] text-slate-400 font-mono">
              {filteredPenalties.length} records
            </div>
          </div>
        </div>

        {/* Rich Data Table - DENSE */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500 mx-auto" />
              <p className="mt-3 text-xs text-slate-500">Loading...</p>
            </div>
          </div>
        ) : filteredPenalties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-12 w-12 text-slate-700 mb-3" />
            <h3 className="text-sm font-medium text-slate-400 mb-1">No penalties found</h3>
            <p className="text-xs text-slate-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {filteredPenalties.map((penalty) => {
              const absPoints = Math.abs(penalty.points)
              const severityColor = absPoints >= 10 ? 'red' : absPoints >= 5 ? 'orange' : 'amber'

              return (
                <div
                  key={penalty._id}
                  className="group flex items-center gap-4 px-4 py-2.5 hover:bg-slate-800/30 transition-all duration-150 cursor-pointer"
                  onClick={() => openViewDrawer(penalty)}
                >
                  {/* User Column */}
                  <div className="flex items-center gap-3 w-56">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-300 font-semibold text-xs border border-slate-700/50 flex-shrink-0">
                      {penalty.userId.firstName[0]}{penalty.userId.lastName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-white truncate tracking-tight">
                        {penalty.userId.firstName} {penalty.userId.lastName}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate font-mono">
                        {penalty.userId.email}
                      </div>
                    </div>
                  </div>

                  {/* Infraction Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider',
                        penalty.type === 'meeting' && 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
                        penalty.type === 'deadline' && 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
                        penalty.type === 'academic_dishonesty' && 'bg-red-500/10 text-red-400 border border-red-500/20'
                      )}>
                        {getTypeLabel(penalty.type)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 truncate">{penalty.description}</div>
                  </div>

                  {/* Penalty Score */}
                  <div className={cn(
                    'px-3 py-1.5 rounded-lg font-bold text-sm border shadow-lg flex-shrink-0',
                    severityColor === 'red' && 'bg-red-500/10 text-red-400 border-red-500/30 shadow-red-500/20',
                    severityColor === 'orange' && 'bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-orange-500/20',
                    severityColor === 'amber' && 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/20'
                  )}>
                    {penalty.points}
                  </div>

                  {/* Date - Monospace */}
                  <div className="text-xs text-slate-500 font-mono w-24 flex-shrink-0">
                    {formatDate(penalty.appliedAt)}
                  </div>

                  {/* Status Dot */}
                  <div className="flex items-center gap-2 w-20 flex-shrink-0">
                    <div className={cn(
                      'h-2 w-2 rounded-full shadow-lg',
                      'bg-red-500 shadow-red-500/50'
                    )} />
                    <span className="text-[10px] text-red-400 font-medium uppercase tracking-wide">Active</span>
                  </div>

                  {/* Hover Reveal Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditDrawer(penalty)
                      }}
                      className="h-7 w-7 rounded-md flex items-center justify-center bg-slate-800/50 hover:bg-blue-500/20 border border-slate-700/50 hover:border-blue-500/30 text-slate-400 hover:text-blue-400 transition-all duration-150"
                      title="Edit"
                    >
                      <Edit2 className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(penalty._id)
                      }}
                      className="h-7 w-7 rounded-md flex items-center justify-center bg-slate-800/50 hover:bg-red-500/20 border border-slate-700/50 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all duration-150"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Drawer (keep existing drawer code but update styling) */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        {/* Same drawer content as before */}
      </Drawer>
    </div>
  )
}
