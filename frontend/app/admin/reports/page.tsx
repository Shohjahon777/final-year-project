'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  FlaskConical,
  GraduationCap,
  Briefcase,
  Globe,
  Calculator,
  AlertTriangle
} from 'lucide-react'
import { adminApi, Score } from '@/lib/api/admin'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

const mockScores: Score[] = [
  {
    _id: '1',
    userId: { _id: 'u1', firstName: 'John', lastName: 'Doe', email: 'john.doe@cau.edu', facultyRank: 'Associate Professor', department: 'Computer Science' },
    academicYear: '2024-2025', research: 28, teaching: 24, admin: 12, outreach: 8, totalPenalties: 0, finalScore: 72, outcome: 'satisfactory',
  },
  {
    _id: '2',
    userId: { _id: 'u2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@cau.edu', facultyRank: 'Professor', department: 'Computer Science' },
    academicYear: '2024-2025', research: 36, teaching: 28, admin: 15, outreach: 6, totalPenalties: 0, finalScore: 85, outcome: 'outstanding',
  },
  {
    _id: '3',
    userId: { _id: 'u3', firstName: 'Robert', lastName: 'Johnson', email: 'robert.j@cau.edu', facultyRank: 'Assistant Professor', department: 'Mathematics' },
    academicYear: '2024-2025', research: 18, teaching: 16, admin: 8, outreach: 5, totalPenalties: -2, finalScore: 45, outcome: 'improvement_plan',
  },
  {
    _id: '4',
    userId: { _id: 'u4', firstName: 'Emily', lastName: 'Brown', email: 'emily.b@cau.edu', facultyRank: 'Lecturer', department: 'Physics' },
    academicYear: '2024-2025', research: 10, teaching: 15, admin: 8, outreach: 5, totalPenalties: -3, finalScore: 35, outcome: 'contract_risk',
  },
  {
    _id: '5',
    userId: { _id: 'u5', firstName: 'Michael', lastName: 'Davis', email: 'michael.d@cau.edu', facultyRank: 'Associate Professor', department: 'Chemistry' },
    academicYear: '2024-2025', research: 24, teaching: 22, admin: 14, outreach: 8, totalPenalties: 0, finalScore: 68, outcome: 'satisfactory',
  },
  {
    _id: '6',
    userId: { _id: 'u6', firstName: 'Sarah', lastName: 'Wilson', email: 'sarah.w@cau.edu', facultyRank: 'Professor', department: 'Biology' },
    academicYear: '2024-2025', research: 40, teaching: 30, admin: 16, outreach: 6, totalPenalties: 0, finalScore: 92, outcome: 'outstanding',
  },
]

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
  const { success } = useToast()

  const fetchScores = async () => {
    setLoading(true)
    try {
      const result = await adminApi.getScores({ academicYear: selectedYear, outcome: selectedOutcome || undefined, limit: 100 })
      setScores(result.scores)
    } catch {
      setScores(mockScores)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchScores() }, [selectedYear, selectedOutcome])

  const filteredScores = scores.filter((s) => {
    if (!search) return true
    return (
      s.userId.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.userId.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.userId.email.toLowerCase().includes(search.toLowerCase()) ||
      s.userId.department?.toLowerCase().includes(search.toLowerCase())
    )
  })

  const stats = {
    total: filteredScores.length,
    avgScore: filteredScores.length
      ? Math.round(filteredScores.reduce((sum, s) => sum + s.finalScore, 0) / filteredScores.length * 10) / 10 : 0,
    outstanding: filteredScores.filter(s => s.outcome === 'outstanding').length,
    satisfactory: filteredScores.filter(s => s.outcome === 'satisfactory').length,
    improvementPlan: filteredScores.filter(s => s.outcome === 'improvement_plan').length,
    contractRisk: filteredScores.filter(s => s.outcome === 'contract_risk').length,
  }

  const exportToCSV = () => {
    const headers = ['Name','Email','Department','Rank','Research','Teaching','Admin','Outreach','Penalties','Final Score','Outcome']
    const rows = filteredScores.map((s) => [
      `${s.userId.firstName} ${s.userId.lastName}`, s.userId.email, s.userId.department || '',
      s.userId.facultyRank || '', s.research, s.teaching, s.admin, s.outreach, s.totalPenalties, s.finalScore, outcomeLabels[s.outcome],
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

  const sortedScores = [...filteredScores].sort((a, b) => b.finalScore - a.finalScore)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Analytics HQ</h1>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-wide font-medium mt-0.5">
            Performance Dashboard • {selectedYear}
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="h-8 px-3 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border border-emerald-400/30 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200 flex items-center gap-1.5"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" strokeWidth={1.5} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="rounded-lg border border-gray-200 dark:border-slate-500/20 bg-gray-50 dark:bg-gray-800/50 p-2.5">
          <div className="h-6 w-6 rounded bg-gray-100 dark:bg-slate-500/10 border border-gray-200 dark:border-slate-500/20 flex items-center justify-center mb-1.5">
            <BarChart3 className="h-3 w-3 text-gray-500 dark:text-slate-400" strokeWidth={1.5} />
          </div>
          <div className="text-2xl font-bold text-gray-700 dark:text-slate-400 tracking-tight">{stats.total}</div>
          <div className="text-[9px] text-gray-500 dark:text-slate-400/60 uppercase tracking-wider font-medium">Total</div>
        </div>

        <div className="rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-950/25 p-2.5">
          <div className="h-6 w-6 rounded bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center mb-1.5">
            <Calculator className="h-3 w-3 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">{stats.avgScore}</div>
          <div className="text-[9px] text-blue-500 dark:text-blue-400/60 uppercase tracking-wider font-medium">Avg Score</div>
        </div>

        <div className="rounded-lg border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/25 p-2.5">
          <div className="h-6 w-6 rounded bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mb-1.5">
            <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{stats.outstanding}</div>
          <div className="text-[9px] text-emerald-500 dark:text-emerald-400/60 uppercase tracking-wider font-medium">Outstanding</div>
        </div>

        <div className="rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-950/25 p-2.5">
          <div className="h-6 w-6 rounded bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center mb-1.5">
            <Minus className="h-3 w-3 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">{stats.satisfactory}</div>
          <div className="text-[9px] text-blue-500 dark:text-blue-400/60 uppercase tracking-wider font-medium">Satisfactory</div>
        </div>

        <div className="rounded-lg border border-orange-200 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-950/25 p-2.5">
          <div className="h-6 w-6 rounded bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 flex items-center justify-center mb-1.5">
            <TrendingDown className="h-3 w-3 text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 tracking-tight">{stats.improvementPlan}</div>
          <div className="text-[9px] text-orange-500 dark:text-orange-400/60 uppercase tracking-wider font-medium">Improvement</div>
        </div>

        <div className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-950/25 p-2.5">
          <div className="h-6 w-6 rounded bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center mb-1.5">
            <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" strokeWidth={1.5} />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 tracking-tight">{stats.contractRisk}</div>
          <div className="text-[9px] text-red-500 dark:text-red-400/60 uppercase tracking-wider font-medium">At Risk</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-lg border border-gray-200 dark:border-slate-800/50 bg-white dark:bg-gray-900/50 p-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-slate-400" strokeWidth={1.5} />
            <Input
              placeholder="Search faculty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 bg-white dark:bg-slate-800/30 border-gray-300 dark:border-slate-700/50 text-xs placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-8 px-3 rounded-lg border border-gray-300 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 text-xs text-gray-900 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2022-2023">2022-2023</option>
          </select>
          <select
            value={selectedOutcome}
            onChange={(e) => setSelectedOutcome(e.target.value)}
            className="h-8 px-3 rounded-lg border border-gray-300 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 text-xs text-gray-900 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Outcomes</option>
            <option value="outstanding">Outstanding</option>
            <option value="satisfactory">Satisfactory</option>
            <option value="improvement_plan">Improvement</option>
            <option value="contract_risk">At Risk</option>
          </select>
          <div className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-gray-100 dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700/50">
            <span className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-wider font-medium">{sortedScores.length} records</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-xl border border-gray-200 dark:border-slate-800/50 bg-white dark:bg-gray-900/50 shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-200 dark:border-slate-800/50 bg-gray-50/80 dark:bg-slate-900/30">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">Performance Leaderboard</h2>
          <p className="text-[9px] text-gray-400 dark:text-slate-400 uppercase tracking-wide font-medium mt-0.5">Ranked by final score</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : sortedScores.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-slate-500 text-xs">No data found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800/50">
                <tr>
                  {['Rank','Faculty','Research','Teaching','Admin','Outreach','Penalty','Final','Status'].map((h, i) => (
                    <th key={h} className={cn('px-3 py-2 text-[9px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider', i === 0 ? 'text-left w-12' : i === 1 ? 'text-left' : i === 8 ? 'text-left' : 'text-center')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/30">
                {sortedScores.map((score, index) => {
                  const rankColors = index === 0
                    ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/10 border-yellow-300 dark:border-yellow-500/30'
                    : index === 1
                    ? 'text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-500/10 border-gray-300 dark:border-slate-500/30'
                    : index === 2
                    ? 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/10 border-orange-300 dark:border-orange-500/30'
                    : 'text-gray-500 dark:text-slate-500 bg-gray-100 dark:bg-slate-800/30 border-gray-200 dark:border-slate-700/50'

                  return (
                    <tr key={score._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className={cn('inline-flex items-center justify-center h-6 w-6 rounded text-[10px] font-bold border', rankColors)}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white tracking-tight">
                          {score.userId.firstName} {score.userId.lastName}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">
                          {score.userId.facultyRank} • {score.userId.department}
                        </p>
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <div className="text-xs font-medium text-blue-600 dark:text-blue-400">{score.research}</div>
                        <div className="text-[9px] text-gray-400 dark:text-slate-500">/40</div>
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <div className="text-xs font-medium text-violet-600 dark:text-violet-400">{score.teaching}</div>
                        <div className="text-[9px] text-gray-400 dark:text-slate-500">/30</div>
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <div className="text-xs font-medium text-gray-600 dark:text-slate-400">{score.admin}</div>
                        <div className="text-[9px] text-gray-400 dark:text-slate-500">/20</div>
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <div className="text-xs font-medium text-amber-600 dark:text-amber-400">{score.outreach}</div>
                        <div className="text-[9px] text-gray-400 dark:text-slate-500">/10</div>
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <span className={cn('text-xs font-medium', score.totalPenalties < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-slate-500')}>
                          {score.totalPenalties}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <div className={cn(
                          'inline-flex items-center justify-center h-7 px-2.5 rounded-lg text-sm font-bold border shadow-sm',
                          score.outcome === 'outstanding' && 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
                          score.outcome === 'satisfactory' && 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
                          score.outcome === 'improvement_plan' && 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30',
                          score.outcome === 'contract_risk' && 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30'
                        )}>
                          {score.finalScore}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={cn(
                          'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border',
                          score.outcome === 'outstanding' && 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
                          score.outcome === 'satisfactory' && 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
                          score.outcome === 'improvement_plan' && 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30',
                          score.outcome === 'contract_risk' && 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30'
                        )}>
                          {outcomeLabels[score.outcome]}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Averages */}
      <div className="rounded-xl border border-gray-200 dark:border-slate-800/50 bg-white dark:bg-gray-900/50 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center">
            <BarChart3 className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">Category Averages</h2>
          <span className="text-[9px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-medium">Performance by Type</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { key: 'research', label: 'Research', max: 40, icon: FlaskConical, getter: (s: Score) => s.research, color: 'blue' },
            { key: 'teaching', label: 'Teaching', max: 30, icon: GraduationCap, getter: (s: Score) => s.teaching, color: 'violet' },
            { key: 'admin', label: 'Admin', max: 20, icon: Briefcase, getter: (s: Score) => s.admin, color: 'slate' },
            { key: 'outreach', label: 'Outreach', max: 10, icon: Globe, getter: (s: Score) => s.outreach, color: 'amber' },
          ].map(({ key, label, max, icon: Icon, getter, color }) => {
            const avg = sortedScores.length ? (sortedScores.reduce((sum, s) => sum + getter(s), 0) / sortedScores.length).toFixed(1) : 0
            const percentage = (Number(avg) / max) * 100
            const circumference = 2 * Math.PI * 28
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
            const cs = {
              blue:   { border: 'border-blue-200 dark:border-blue-500/20',   bg: 'bg-blue-50 dark:bg-blue-950/25',   text: 'text-blue-600 dark:text-blue-400',   iconBg: 'bg-blue-100 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',   track: 'text-blue-200 dark:text-slate-800/50' },
              violet: { border: 'border-violet-200 dark:border-violet-500/20', bg: 'bg-violet-50 dark:bg-violet-950/25', text: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-100 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20', track: 'text-violet-200 dark:text-slate-800/50' },
              slate:  { border: 'border-gray-200 dark:border-slate-500/20',   bg: 'bg-gray-50 dark:bg-gray-800/50',   text: 'text-gray-600 dark:text-slate-400',   iconBg: 'bg-gray-100 dark:bg-slate-500/10 border-gray-200 dark:border-slate-500/20',   track: 'text-gray-300 dark:text-slate-800/50' },
              amber:  { border: 'border-amber-200 dark:border-amber-500/20',  bg: 'bg-amber-50 dark:bg-amber-950/25',  text: 'text-amber-600 dark:text-amber-400',  iconBg: 'bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',  track: 'text-amber-200 dark:text-slate-800/50' },
            }[color]!
            return (
              <div key={key} className={cn('relative rounded-lg border p-3', cs.border, cs.bg)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={cn('h-5 w-5 rounded border flex items-center justify-center', cs.iconBg)}>
                        <Icon className={cn('h-2.5 w-2.5', cs.text)} strokeWidth={1.5} />
                      </div>
                      <span className={cn('text-[10px] font-medium uppercase tracking-wide', cs.text)}>{label}</span>
                    </div>
                    <div className={cn('text-2xl font-bold tracking-tight', cs.text)}>{avg}</div>
                    <div className={cn('text-[9px] uppercase tracking-wider', cs.text, 'opacity-60')}>avg / {max} max</div>
                  </div>
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle cx="28" cy="28" r="26" fill="none" stroke="currentColor" strokeWidth="3" className={cs.track} />
                    <circle cx="28" cy="28" r="26" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={strokeDasharray} className={cs.text} strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
