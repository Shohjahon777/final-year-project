'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Filter,
  UserPlus,
  MoreHorizontal,
  Eye,
  AlertTriangle,
  Mail,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { adminApi, Faculty } from '@/lib/api/admin'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

// Mock faculty data
const mockFaculty: Faculty[] = [
  {
    _id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@cau.edu',
    role: 'faculty',
    facultyRank: 'Associate Professor',
    department: 'Computer Science',
    isActive: true,
    currentScore: {
      finalScore: 72,
      outcome: 'satisfactory',
      research: 28,
      teaching: 24,
      admin: 12,
      outreach: 8,
      totalPenalties: 0,
    },
  },
  {
    _id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@cau.edu',
    role: 'faculty',
    facultyRank: 'Professor',
    department: 'Computer Science',
    isActive: true,
    currentScore: {
      finalScore: 85,
      outcome: 'outstanding',
      research: 36,
      teaching: 28,
      admin: 15,
      outreach: 6,
      totalPenalties: 0,
    },
  },
  {
    _id: '3',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.j@cau.edu',
    role: 'faculty',
    facultyRank: 'Assistant Professor',
    department: 'Mathematics',
    isActive: true,
    currentScore: {
      finalScore: 45,
      outcome: 'improvement_plan',
      research: 18,
      teaching: 16,
      admin: 8,
      outreach: 5,
      totalPenalties: -2,
    },
  },
  {
    _id: '4',
    firstName: 'Emily',
    lastName: 'Brown',
    email: 'emily.b@cau.edu',
    role: 'faculty',
    facultyRank: 'Lecturer',
    department: 'Physics',
    isActive: true,
    currentScore: {
      finalScore: 35,
      outcome: 'contract_risk',
      research: 10,
      teaching: 15,
      admin: 8,
      outreach: 5,
      totalPenalties: -3,
    },
  },
  {
    _id: '5',
    firstName: 'Michael',
    lastName: 'Davis',
    email: 'michael.d@cau.edu',
    role: 'faculty',
    facultyRank: 'Associate Professor',
    department: 'Chemistry',
    isActive: true,
    currentScore: {
      finalScore: 68,
      outcome: 'satisfactory',
      research: 24,
      teaching: 22,
      admin: 14,
      outreach: 8,
      totalPenalties: 0,
    },
  },
  {
    _id: '6',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.w@cau.edu',
    role: 'faculty',
    facultyRank: 'Professor',
    department: 'Biology',
    isActive: true,
    currentScore: {
      finalScore: 92,
      outcome: 'outstanding',
      research: 40,
      teaching: 30,
      admin: 16,
      outreach: 6,
      totalPenalties: 0,
    },
  },
]

const outcomeColors: Record<string, string> = {
  outstanding: 'success',
  satisfactory: 'primary',
  improvement_plan: 'warning',
  contract_risk: 'danger',
}

const outcomeLabels: Record<string, string> = {
  outstanding: 'Outstanding',
  satisfactory: 'Satisfactory',
  improvement_plan: 'Improvement Plan',
  contract_risk: 'Contract Risk',
}

export default function AdminUsersPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [selectedRank, setSelectedRank] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { error: showError } = useToast()
  const router = useRouter()

  const fetchFaculty = async () => {
    setLoading(true)
    try {
      const result = await adminApi.getFaculty({
        search,
        department: selectedDepartment || undefined,
        rank: selectedRank || undefined,
        page,
        limit: 10,
      })
      setFaculty(result.faculty)
      setTotalPages(result.pagination.pages)
    } catch (err) {
      // Use mock data if API fails
      setFaculty(mockFaculty)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaculty()
  }, [page])

  const handleSearch = () => {
    setPage(1)
    fetchFaculty()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Get unique departments and ranks from data
  const departments = [...new Set(faculty.map((f) => f.department).filter(Boolean))]
  const ranks = [...new Set(faculty.map((f) => f.facultyRank).filter(Boolean))]

  // Filter faculty locally for instant feedback
  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      !search ||
      f.firstName.toLowerCase().includes(search.toLowerCase()) ||
      f.lastName.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase())
    const matchesDept = !selectedDepartment || f.department === selectedDepartment
    const matchesRank = !selectedRank || f.facultyRank === selectedRank
    return matchesSearch && matchesDept && matchesRank
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage faculty members and their information
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Faculty
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value)}
              className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">All Ranks</option>
              {ranks.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={handleSearch}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="ghost" onClick={fetchFaculty}>
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Table */}
      <Card>
        <CardHeader>
          <CardTitle>Faculty Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No faculty members found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredFaculty.map((f) => (
                    <tr key={f._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                            {f.firstName[0]}
                            {f.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-50">
                              {f.firstName} {f.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{f.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {f.department || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {f.facultyRank || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-lg font-bold',
                              f.currentScore?.outcome === 'outstanding' && 'text-success-600',
                              f.currentScore?.outcome === 'satisfactory' && 'text-primary-600',
                              f.currentScore?.outcome === 'improvement_plan' && 'text-warning-600',
                              f.currentScore?.outcome === 'contract_risk' && 'text-danger-600'
                            )}
                          >
                            {f.currentScore?.finalScore ?? '-'}
                          </span>
                          {f.currentScore?.totalPenalties !== 0 && (
                            <span className="text-xs text-danger-500">
                              ({f.currentScore?.totalPenalties})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {f.currentScore?.outcome ? (
                          <Badge variant={outcomeColors[f.currentScore.outcome] as any}>
                            {outcomeLabels[f.currentScore.outcome]}
                          </Badge>
                        ) : (
                          <Badge variant="default">No Score</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/admin/users/${f._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-warning-600"
                            onClick={() =>
                              router.push(`/admin/penalties?userId=${f._id}`)
                            }
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
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
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
