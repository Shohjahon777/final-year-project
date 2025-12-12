'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Eye,
  Link as LinkIcon,
  MessageSquare,
  Tag,
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

// Mock faculty list for the dropdown
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
  
  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null)
  
  // Form state
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
      // Use mock data
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

  // Filter penalties locally for search
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

  // Calculate totals
  const totalDeductions = penalties.reduce((sum, p) => sum + p.points, 0)

  const getTypeLabel = (type: string) => {
    return penaltyTypes.find((t) => t.value === type)?.label || type
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Penalty Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Apply and manage faculty penalties
          </p>
        </div>
        <Button onClick={openCreateDrawer}>
          <Plus className="h-4 w-4 mr-2" />
          Apply Penalty
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Penalties</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                  {penalties.length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Deductions</p>
                <p className="text-2xl font-bold text-danger-600">{totalDeductions} pts</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-danger-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Academic Year</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">2024-2025</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by description or faculty name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value)
                setPage(1)
              }}
              className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">All Types</option>
              {penaltyTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Penalties Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Penalties</CardTitle>
          <CardDescription>Penalties applied this academic year</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            </div>
          ) : filteredPenalties.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No penalties found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredPenalties.map((penalty) => (
                    <tr
                      key={penalty._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => openViewDrawer(penalty)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium">
                            {penalty.userId.firstName[0]}
                            {penalty.userId.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-50">
                              {penalty.userId.firstName} {penalty.userId.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{penalty.userId.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn('px-2 py-1 rounded text-xs font-medium', typeColors[penalty.type])}>
                          {getTypeLabel(penalty.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {penalty.description}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-danger-600">{penalty.points}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(penalty.appliedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              openViewDrawer(penalty)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditDrawer(penalty)
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-danger-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(penalty._id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Penalty Drawer */}
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
              <DrawerDescription>
                Applied on {formatDateFull(selectedPenalty.appliedAt)}
              </DrawerDescription>
            </DrawerHeader>

            <DrawerContent className="space-y-6">
              {/* Faculty Information */}
              <DrawerSection icon={<User className="h-4 w-4" />} label="Faculty Member">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-medium">
                    {selectedPenalty.userId.firstName[0]}
                    {selectedPenalty.userId.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-50">
                      {selectedPenalty.userId.firstName} {selectedPenalty.userId.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{selectedPenalty.userId.email}</p>
                  </div>
                </div>
              </DrawerSection>

              {/* Description */}
              <DrawerSection icon={<MessageSquare className="h-4 w-4" />} label="Description">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                  {selectedPenalty.description}
                </div>
              </DrawerSection>

              {/* Points */}
              <DrawerSection icon={<Calculator className="h-4 w-4" />} label="Points Deduction">
                <div className="p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg border border-danger-200 dark:border-danger-800">
                  <p className="text-3xl font-bold text-danger-600">{selectedPenalty.points}</p>
                  <p className="text-sm text-danger-600/80 mt-1">points deducted from final score</p>
                </div>
              </DrawerSection>

              {/* Evidence */}
              {selectedPenalty.evidence && (
                <DrawerSection icon={<LinkIcon className="h-4 w-4" />} label="Evidence">
                  <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <a
                      href={selectedPenalty.evidence}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-2"
                    >
                      <LinkIcon className="h-4 w-4" />
                      {selectedPenalty.evidence}
                    </a>
                  </div>
                </DrawerSection>
              )}

              {/* Details */}
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
              <Button variant="outline" onClick={closeDrawer}>
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDrawerMode('edit')
                  setFormData({
                    userId: selectedPenalty.userId._id,
                    type: selectedPenalty.type,
                    description: selectedPenalty.description,
                    points: Math.abs(selectedPenalty.points),
                    evidence: selectedPenalty.evidence,
                  })
                }}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(selectedPenalty._id)}
                disabled={actionLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DrawerFooter>
          </>
        ) : (
          <>
            <DrawerHeader breadcrumb={`Penalties / ${drawerMode === 'create' ? 'New' : 'Edit'}`}>
              <DrawerTitle>
                {drawerMode === 'create' ? 'Apply New Penalty' : 'Edit Penalty'}
              </DrawerTitle>
              <DrawerDescription>
                {drawerMode === 'create'
                  ? 'Apply a penalty deduction to a faculty member'
                  : 'Update the penalty details'}
              </DrawerDescription>
            </DrawerHeader>

            <DrawerContent className="space-y-6">
              {/* Faculty Selection */}
              <DrawerSection icon={<User className="h-4 w-4" />} label="Faculty Member">
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, userId: e.target.value }))}
                  disabled={drawerMode === 'edit'}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm dark:border-gray-700 dark:bg-gray-900 disabled:opacity-50"
                >
                  <option value="">Select faculty member...</option>
                  {facultyList.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.firstName} {f.lastName} ({f.email})
                    </option>
                  ))}
                </select>
                {!formData.userId && (
                  <p className="text-xs text-danger-500 mt-1">Required</p>
                )}
              </DrawerSection>

              {/* Penalty Type */}
              <DrawerSection icon={<Tag className="h-4 w-4" />} label="Penalty Type">
                <div className="space-y-2">
                  {penaltyTypes.map((type) => (
                    <label
                      key={type.value}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                        formData.type === type.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="radio"
                        name="penaltyType"
                        value={type.value}
                        checked={formData.type === type.value}
                        onChange={() => handleTypeChange(type.value as any)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-gray-50">
                            {type.label}
                          </span>
                          <span className="text-sm font-bold text-danger-600">
                            {type.points} pts
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </DrawerSection>

              {/* Description */}
              <DrawerSection icon={<MessageSquare className="h-4 w-4" />} label="Description">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the reason for this penalty..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 placeholder:text-gray-400 text-sm resize-none"
                />
                {!formData.description && (
                  <p className="text-xs text-danger-500 mt-1">Required</p>
                )}
              </DrawerSection>

              {/* Points */}
              <DrawerSection icon={<Calculator className="h-4 w-4" />} label="Points Deduction">
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData((prev) => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    className="w-24"
                    min={1}
                  />
                  <div className="flex-1">
                    <div className="p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg border border-danger-200 dark:border-danger-800">
                      <p className="text-sm text-danger-600">
                        Will deduct <strong>{formData.points}</strong> points from the faculty member's score
                      </p>
                    </div>
                  </div>
                </div>
              </DrawerSection>

              {/* Evidence (Optional) */}
              <DrawerSection icon={<LinkIcon className="h-4 w-4" />} label="Evidence (Optional)">
                <Input
                  value={formData.evidence || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, evidence: e.target.value }))}
                  placeholder="Link to supporting evidence..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide a link to any supporting documentation
                </p>
              </DrawerSection>
            </DrawerContent>

            <DrawerFooter>
              <Button variant="outline" onClick={closeDrawer}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleSubmit}
                disabled={actionLoading || !formData.userId || !formData.description}
              >
                {actionLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : drawerMode === 'edit' ? (
                  'Update Penalty'
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Apply Penalty
                  </>
                )}
              </Button>
            </DrawerFooter>
          </>
        )}
      </Drawer>
    </div>
  )
}
