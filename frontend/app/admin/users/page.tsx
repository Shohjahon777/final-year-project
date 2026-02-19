'use client'

import { useEffect, useState, useRef } from 'react'
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
  User,
  FileText,
  List,
  Users,
} from 'lucide-react'
import { adminApi, Faculty } from '@/lib/api/admin'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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
  const [moreOpenId, setMoreOpenId] = useState<string | null>(null)
  const moreRef = useRef<HTMLDivElement>(null)
  const { error: showError } = useToast()
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpenId(null)
    }
    if (moreOpenId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [moreOpenId])

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
    } catch {
      setFaculty([])
      setTotalPages(0)
      showError('Failed to load users', 'Could not load faculty list. Please try again.')
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

  // Calculate stats
  const stats = {
    total: filteredFaculty.length,
    outstanding: filteredFaculty.filter(f => f.currentScore?.outcome === 'outstanding').length,
    satisfactory: filteredFaculty.filter(f => f.currentScore?.outcome === 'satisfactory').length,
    improvement: filteredFaculty.filter(f => f.currentScore?.outcome === 'improvement_plan').length,
    atRisk: filteredFaculty.filter(f => f.currentScore?.outcome === 'contract_risk').length,
  }

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Link href="/admin" className="hover:text-gray-700 dark:hover:text-gray-300">Admin</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-50 font-medium">Users</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Faculty</h1>
        </div>
        <Button type="button" size="sm" onClick={() => router.push('/register')}>
          <UserPlus className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs">Add Faculty</span>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-50 mt-0.5">{stats.total}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/50 p-3">
          <p className="text-[10px] font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">Outstanding</p>
          <p className="text-xl font-bold text-green-900 dark:text-green-300 mt-0.5">{stats.outstanding}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/50 p-3">
          <p className="text-[10px] font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">Satisfactory</p>
          <p className="text-xl font-bold text-blue-900 dark:text-blue-300 mt-0.5">{stats.satisfactory}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/50 p-3">
          <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">Improving</p>
          <p className="text-xl font-bold text-amber-900 dark:text-amber-300 mt-0.5">{stats.improvement}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/50 p-3">
          <p className="text-[10px] font-medium text-red-700 dark:text-red-400 uppercase tracking-wide">At Risk</p>
          <p className="text-xl font-bold text-red-900 dark:text-red-300 mt-0.5">{stats.atRisk}</p>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="h-8 px-2 rounded-md border border-gray-300 bg-white text-xs dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={selectedRank}
            onChange={(e) => setSelectedRank(e.target.value)}
            className="h-8 px-2 rounded-md border border-gray-300 bg-white text-xs dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">Rank</option>
            {ranks.map((rank) => (
              <option key={rank} value={rank}>{rank}</option>
            ))}
          </select>
          <Button type="button" size="sm" variant="ghost" onClick={fetchFaculty} className="h-8 w-8 p-0" title="Refresh">
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Faculty List - Enhanced Cards */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
              <p className="mt-3 text-xs text-gray-500">Loading faculty...</p>
            </div>
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <Users className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-1">No faculty members</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-sm mb-4">
              {search || selectedDepartment || selectedRank
                ? 'No users match your filters. Try adjusting search or filters.'
                : 'No faculty have been added yet.'}
            </p>
            {(search || selectedDepartment || selectedRank) && (
              <Button variant="outline" size="sm" onClick={() => { setSearch(''); setSelectedDepartment(''); setSelectedRank(''); setPage(1); }}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          filteredFaculty.map((f) => {
            const score = f.currentScore?.finalScore ?? 0
            const outcome = f.currentScore?.outcome
            const scorePercentage = Math.min(100, (score / 100) * 100)

            return (
              <div
                key={f._id}
                className="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left: User Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Avatar with outcome color */}
                    <div className={cn(
                      'h-11 w-11 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0',
                      outcome === 'outstanding' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                      outcome === 'satisfactory' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                      outcome === 'improvement_plan' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                      outcome === 'contract_risk' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
                      !outcome && 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    )}>
                      {f.firstName[0]}{f.lastName[0]}
                    </div>

                    {/* Name, Email, Dept, Rank */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-50 truncate">
                          {f.firstName} {f.lastName}
                        </p>
                        {/* Outcome Badge - Compact */}
                        {outcome && (
                          <span className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide',
                            outcome === 'outstanding' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                            outcome === 'satisfactory' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                            outcome === 'improvement_plan' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                            outcome === 'contract_risk' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          )}>
                            {outcome === 'outstanding' && 'Outstanding'}
                            {outcome === 'satisfactory' && 'Satisfactory'}
                            {outcome === 'improvement_plan' && 'Improving'}
                            {outcome === 'contract_risk' && 'At Risk'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-1">{f.email}</p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <span>{f.department || 'No dept'}</span>
                        <span>•</span>
                        <span>{f.facultyRank || 'No rank'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Score with Progress Bar */}
                  <div className="flex-shrink-0 w-32">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-gray-500 uppercase">Score</span>
                      <span className={cn(
                        'text-lg font-bold',
                        outcome === 'outstanding' && 'text-green-700 dark:text-green-400',
                        outcome === 'satisfactory' && 'text-blue-700 dark:text-blue-400',
                        outcome === 'improvement_plan' && 'text-amber-700 dark:text-amber-400',
                        outcome === 'contract_risk' && 'text-red-700 dark:text-red-400',
                        !outcome && 'text-gray-700 dark:text-gray-400'
                      )}>
                        {score}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-300',
                          outcome === 'outstanding' && 'bg-green-500',
                          outcome === 'satisfactory' && 'bg-blue-500',
                          outcome === 'improvement_plan' && 'bg-amber-500',
                          outcome === 'contract_risk' && 'bg-red-500',
                          !outcome && 'bg-gray-400'
                        )}
                        style={{ width: `${scorePercentage}%` }}
                      />
                    </div>
                    {f.currentScore?.totalPenalties !== 0 && (
                      <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                        {f.currentScore?.totalPenalties} penalties
                      </p>
                    )}
                  </div>

                  {/* Right: Quick Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => router.push(`/admin/users/${f._id}`)}
                      className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                      title="View profile"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => router.push(`/admin/submissions?userId=${f._id}`)}
                      className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                      title="View submissions"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </button>
                    <a
                      href={`mailto:${f.email}`}
                      className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                      title="Send email"
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => router.push(`/admin/penalties?userId=${f._id}`)}
                      className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-amber-600 dark:text-amber-400 transition-colors"
                      title="Manage penalties"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Compact Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="text-xs ml-1">Prev</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
