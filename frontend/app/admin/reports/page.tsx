'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
} from 'lucide-react'
import { adminApi, Score } from '@/lib/api/admin'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

// Mock scores data
const mockScores: Score[] = [
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
    academicYear: '2024-2025',
    research: 28,
    teaching: 24,
    admin: 12,
    outreach: 8,
    totalPenalties: 0,
    finalScore: 72,
    outcome: 'satisfactory',
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
    academicYear: '2024-2025',
    research: 36,
    teaching: 28,
    admin: 15,
    outreach: 6,
    totalPenalties: 0,
    finalScore: 85,
    outcome: 'outstanding',
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
    academicYear: '2024-2025',
    research: 18,
    teaching: 16,
    admin: 8,
    outreach: 5,
    totalPenalties: -2,
    finalScore: 45,
    outcome: 'improvement_plan',
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
    academicYear: '2024-2025',
    research: 10,
    teaching: 15,
    admin: 8,
    outreach: 5,
    totalPenalties: -3,
    finalScore: 35,
    outcome: 'contract_risk',
  },
  {
    _id: '5',
    userId: {
      _id: 'u5',
      firstName: 'Michael',
      lastName: 'Davis',
      email: 'michael.d@cau.edu',
      facultyRank: 'Associate Professor',
      department: 'Chemistry',
    },
    academicYear: '2024-2025',
    research: 24,
    teaching: 22,
    admin: 14,
    outreach: 8,
    totalPenalties: 0,
    finalScore: 68,
    outcome: 'satisfactory',
  },
  {
    _id: '6',
    userId: {
      _id: 'u6',
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.w@cau.edu',
      facultyRank: 'Professor',
      department: 'Biology',
    },
    academicYear: '2024-2025',
    research: 40,
    teaching: 30,
    admin: 16,
    outreach: 6,
    totalPenalties: 0,
    finalScore: 92,
    outcome: 'outstanding',
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

export default function AdminReportsPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedOutcome, setSelectedOutcome] = useState('')
  const [selectedYear, setSelectedYear] = useState('2024-2025')
  const { success, error: showError } = useToast()

  const fetchScores = async () => {
    setLoading(true)
    try {
      const result = await adminApi.getScores({
        academicYear: selectedYear,
        outcome: selectedOutcome || undefined,
        limit: 100,
      })
      setScores(result.scores)
    } catch (err) {
      // Use mock data
      setScores(mockScores)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScores()
  }, [selectedYear, selectedOutcome])

  // Filter scores locally for search
  const filteredScores = scores.filter((s) => {
    if (!search) return true
    return (
      s.userId.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.userId.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.userId.email.toLowerCase().includes(search.toLowerCase()) ||
      s.userId.department?.toLowerCase().includes(search.toLowerCase())
    )
  })

  // Calculate statistics
  const stats = {
    total: filteredScores.length,
    avgScore: filteredScores.length
      ? Math.round(filteredScores.reduce((sum, s) => sum + s.finalScore, 0) / filteredScores.length * 10) / 10
      : 0,
    outstanding: filteredScores.filter((s) => s.outcome === 'outstanding').length,
    satisfactory: filteredScores.filter((s) => s.outcome === 'satisfactory').length,
    improvementPlan: filteredScores.filter((s) => s.outcome === 'improvement_plan').length,
    contractRisk: filteredScores.filter((s) => s.outcome === 'contract_risk').length,
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Department',
      'Rank',
      'Research',
      'Teaching',
      'Admin',
      'Outreach',
      'Penalties',
      'Final Score',
      'Outcome',
    ]
    const rows = filteredScores.map((s) => [
      `${s.userId.firstName} ${s.userId.lastName}`,
      s.userId.email,
      s.userId.department || '',
      s.userId.facultyRank || '',
      s.research,
      s.teaching,
      s.admin,
      s.outreach,
      s.totalPenalties,
      s.finalScore,
      outcomeLabels[s.outcome],
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `faculty-report-${selectedYear}.csv`
    a.click()
    URL.revokeObjectURL(url)
    success('Export Complete', 'Report has been downloaded as CSV')
  }

  // Sort by final score descending
  const sortedScores = [...filteredScores].sort((a, b) => b.finalScore - a.finalScore)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Faculty performance reports and analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportToCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Total Faculty</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Average Score</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.avgScore}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Outstanding</p>
            <p className="text-2xl font-bold text-success-600">{stats.outstanding}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Satisfactory</p>
            <p className="text-2xl font-bold text-primary-600">{stats.satisfactory}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Improvement</p>
            <p className="text-2xl font-bold text-warning-600">{stats.improvementPlan}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">At Risk</p>
            <p className="text-2xl font-bold text-danger-600">{stats.contractRisk}</p>
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
                placeholder="Search by name, email, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2022-2023">2022-2023</option>
            </select>
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
              className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">All Outcomes</option>
              <option value="outstanding">Outstanding</option>
              <option value="satisfactory">Satisfactory</option>
              <option value="improvement_plan">Improvement Plan</option>
              <option value="contract_risk">Contract Risk</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Faculty Performance - {selectedYear}</CardTitle>
          <CardDescription>
            Ranked by final score. Click export to download full report.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            </div>
          ) : sortedScores.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No data found for the selected filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Research
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teaching
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outreach
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Penalties
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Final
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outcome
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {sortedScores.map((score, index) => (
                    <tr key={score._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-50">
                            {score.userId.firstName} {score.userId.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {score.userId.facultyRank} • {score.userId.department}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-chart-research">
                            {score.research}
                          </span>
                          <span className="text-xs text-gray-400">/40</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-chart-teaching">
                            {score.teaching}
                          </span>
                          <span className="text-xs text-gray-400">/30</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-chart-admin">
                            {score.admin}
                          </span>
                          <span className="text-xs text-gray-400">/20</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-chart-outreach">
                            {score.outreach}
                          </span>
                          <span className="text-xs text-gray-400">/10</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className={cn(
                            'text-sm font-medium',
                            score.totalPenalties < 0 ? 'text-danger-600' : 'text-gray-400'
                          )}
                        >
                          {score.totalPenalties}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className={cn(
                            'text-lg font-bold',
                            score.outcome === 'outstanding' && 'text-success-600',
                            score.outcome === 'satisfactory' && 'text-primary-600',
                            score.outcome === 'improvement_plan' && 'text-warning-600',
                            score.outcome === 'contract_risk' && 'text-danger-600'
                          )}
                        >
                          {score.finalScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={outcomeColors[score.outcome] as any}>
                          {outcomeLabels[score.outcome]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance Summary</CardTitle>
          <CardDescription>Average points by category across all faculty</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-lg bg-chart-research/10 border border-chart-research/30">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-5 w-5 text-chart-research" />
                <span className="font-medium text-gray-900 dark:text-gray-50">Research</span>
              </div>
              <p className="text-3xl font-bold text-chart-research">
                {sortedScores.length
                  ? (sortedScores.reduce((sum, s) => sum + s.research, 0) / sortedScores.length).toFixed(1)
                  : 0}
              </p>
              <p className="text-sm text-gray-500">avg of 40 max</p>
            </div>
            <div className="p-4 rounded-lg bg-chart-teaching/10 border border-chart-teaching/30">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-5 w-5 text-chart-teaching" />
                <span className="font-medium text-gray-900 dark:text-gray-50">Teaching</span>
              </div>
              <p className="text-3xl font-bold text-chart-teaching">
                {sortedScores.length
                  ? (sortedScores.reduce((sum, s) => sum + s.teaching, 0) / sortedScores.length).toFixed(1)
                  : 0}
              </p>
              <p className="text-sm text-gray-500">avg of 30 max</p>
            </div>
            <div className="p-4 rounded-lg bg-chart-admin/10 border border-chart-admin/30">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-5 w-5 text-chart-admin" />
                <span className="font-medium text-gray-900 dark:text-gray-50">Administrative</span>
              </div>
              <p className="text-3xl font-bold text-chart-admin">
                {sortedScores.length
                  ? (sortedScores.reduce((sum, s) => sum + s.admin, 0) / sortedScores.length).toFixed(1)
                  : 0}
              </p>
              <p className="text-sm text-gray-500">avg of 20 max</p>
            </div>
            <div className="p-4 rounded-lg bg-chart-outreach/10 border border-chart-outreach/30">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-5 w-5 text-chart-outreach" />
                <span className="font-medium text-gray-900 dark:text-gray-50">Outreach</span>
              </div>
              <p className="text-3xl font-bold text-chart-outreach">
                {sortedScores.length
                  ? (sortedScores.reduce((sum, s) => sum + s.outreach, 0) / sortedScores.length).toFixed(1)
                  : 0}
              </p>
              <p className="text-sm text-gray-500">avg of 10 max</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
