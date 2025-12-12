'use client'

import { useState } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockScores, mockDashboardData } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info
} from 'lucide-react'

function ScoresContent() {
  const [selectedYear, setSelectedYear] = useState('2024-2025')
  const currentScore = mockScores.find(s => s.academicYear === selectedYear) || mockScores[0]
  const previousScore = mockScores.find(s => s.academicYear === '2023-2024')

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'outstanding': return 'text-success-600 dark:text-success-400'
      case 'satisfactory': return 'text-primary-600 dark:text-primary-400'
      case 'improvement_plan': return 'text-warning-600 dark:text-warning-400'
      case 'contract_risk': return 'text-danger-600 dark:text-danger-400'
      default: return 'text-gray-600'
    }
  }

  const getOutcomeBadgeVariant = (outcome: string): 'success' | 'primary' | 'warning' | 'danger' | 'default' => {
    switch (outcome) {
      case 'outstanding': return 'success'
      case 'satisfactory': return 'primary'
      case 'improvement_plan': return 'warning'
      case 'contract_risk': return 'danger'
      default: return 'default'
    }
  }

  const getOutcomeLabel = (outcome: string) => {
    switch (outcome) {
      case 'outstanding': return 'Outstanding'
      case 'satisfactory': return 'Satisfactory'
      case 'improvement_plan': return 'Improvement Plan'
      case 'contract_risk': return 'Contract Risk'
      default: return outcome
    }
  }

  // Calculate change from previous year
  const calculateChange = (current: number, previous: number | undefined) => {
    if (!previous) return null
    return current - previous
  }

  const renderChange = (change: number | null) => {
    if (change === null) return <span className="text-gray-400 text-xs">N/A</span>
    if (change > 0) return (
      <span className="flex items-center text-success-600 text-xs font-medium">
        <ArrowUpRight className="h-3 w-3 mr-0.5" />
        +{change.toFixed(2)}
      </span>
    )
    if (change < 0) return (
      <span className="flex items-center text-danger-600 text-xs font-medium">
        <ArrowDownRight className="h-3 w-3 mr-0.5" />
        {change.toFixed(2)}
      </span>
    )
    return (
      <span className="flex items-center text-gray-400 text-xs">
        <Minus className="h-3 w-3 mr-0.5" />
        0.00
      </span>
    )
  }

  // Category data
  const categories = [
    { 
      name: 'Research', 
      current: currentScore.research, 
      previous: previousScore?.research,
      max: 40, 
      color: 'bg-primary-500',
      lightColor: 'bg-primary-100 dark:bg-primary-900/30'
    },
    { 
      name: 'Teaching', 
      current: currentScore.teaching, 
      previous: previousScore?.teaching,
      max: 30, 
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    { 
      name: 'Administrative', 
      current: currentScore.admin, 
      previous: previousScore?.admin,
      max: 20, 
      color: 'bg-success-500',
      lightColor: 'bg-success-100 dark:bg-success-900/30'
    },
    { 
      name: 'Outreach', 
      current: currentScore.outreach, 
      previous: previousScore?.outreach,
      max: 10, 
      color: 'bg-warning-500',
      lightColor: 'bg-warning-100 dark:bg-warning-900/30'
    },
  ]

  const totalMax = 100
  const totalCurrent = currentScore.research + currentScore.teaching + currentScore.admin + currentScore.outreach

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
              Score Overview
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your performance scores and category breakdown
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Year Selector */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-10 pl-3 pr-8 rounded-md border border-gray-300 bg-white text-sm text-gray-700 appearance-none cursor-pointer dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Main Score Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Final Score */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Final Score
                </div>
                <div className="text-score-xl font-mono text-gray-900 dark:text-gray-50">
                  {currentScore.finalScore.toFixed(2)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={getOutcomeBadgeVariant(currentScore.outcome)}>
                    {getOutcomeLabel(currentScore.outcome)}
                  </Badge>
                  {previousScore && (
                    <span className="text-sm text-gray-500">
                      vs {previousScore.finalScore.toFixed(2)} last year
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {previousScore && (
                  <div className="flex items-center gap-1">
                    {currentScore.finalScore > previousScore.finalScore ? (
                      <TrendingUp className="h-5 w-5 text-success-500" />
                    ) : currentScore.finalScore < previousScore.finalScore ? (
                      <TrendingDown className="h-5 w-5 text-danger-500" />
                    ) : null}
                    <span className={cn(
                      "text-lg font-semibold",
                      currentScore.finalScore > previousScore.finalScore ? "text-success-600" : 
                      currentScore.finalScore < previousScore.finalScore ? "text-danger-600" : "text-gray-500"
                    )}>
                      {currentScore.finalScore > previousScore.finalScore ? '+' : ''}
                      {(currentScore.finalScore - previousScore.finalScore).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Points Earned</span>
                  <span className="text-sm font-semibold font-mono text-gray-900 dark:text-gray-50">
                    {totalCurrent.toFixed(2)} / {totalMax}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Penalties Applied</span>
                  <span className="text-sm font-semibold font-mono text-danger-600">
                    {currentScore.totalPenalties.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${(currentScore.finalScore / totalMax) * 100}%` }}
                />
                {/* Threshold markers */}
                <div className="absolute inset-y-0 left-[40%] w-px bg-gray-300 dark:bg-gray-700" />
                <div className="absolute inset-y-0 left-[60%] w-px bg-gray-300 dark:bg-gray-700" />
                <div className="absolute inset-y-0 left-[80%] w-px bg-gray-300 dark:bg-gray-700" />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>0</span>
                <span>40 (Risk)</span>
                <span>60 (Satisfactory)</span>
                <span>80 (Outstanding)</span>
                <span>100</span>
              </div>
            </div>
          </div>

          {/* Score History */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
              Score History
            </div>
            <div className="space-y-4">
              {mockScores.map((score) => (
                <div 
                  key={score._id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors cursor-pointer",
                    score.academicYear === selectedYear 
                      ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/10" 
                      : "border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                  )}
                  onClick={() => setSelectedYear(score.academicYear)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                        {score.academicYear}
                      </span>
                    </div>
                    <Badge variant={getOutcomeBadgeVariant(score.outcome)} className="text-xs">
                      {getOutcomeLabel(score.outcome)}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold font-mono text-gray-900 dark:text-gray-50">
                    {score.finalScore.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
            Category Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat) => {
              const percentage = (cat.current / cat.max) * 100
              const change = calculateChange(cat.current, cat.previous)
              
              return (
                <div 
                  key={cat.name}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {cat.name}
                    </span>
                    {renderChange(change)}
                  </div>
                  
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-bold font-mono text-gray-900 dark:text-gray-50">
                      {cat.current.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-400">/ {cat.max}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500", cat.color)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {percentage.toFixed(0)}% of maximum
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detailed Score Table */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
            Year-over-Year Comparison
          </h2>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Max Points</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">2023-2024</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">2024-2025</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {categories.map((cat) => {
                  const change = calculateChange(cat.current, cat.previous)
                  return (
                    <tr key={cat.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-3 w-3 rounded-full", cat.color)} />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-50">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-gray-500">{cat.max}</td>
                      <td className="px-4 py-4 text-right text-sm font-mono text-gray-700 dark:text-gray-300">
                        {cat.previous?.toFixed(2) || '—'}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-mono font-medium text-gray-900 dark:text-gray-50">
                        {cat.current.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {renderChange(change)}
                      </td>
                    </tr>
                  )
                })}
                {/* Penalties row */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-danger-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-50">Penalties</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-gray-500">—</td>
                  <td className="px-4 py-4 text-right text-sm font-mono text-danger-600">
                    {previousScore?.totalPenalties.toFixed(2) || '—'}
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-mono font-medium text-danger-600">
                    {currentScore.totalPenalties.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {renderChange(calculateChange(currentScore.totalPenalties, previousScore?.totalPenalties))}
                  </td>
                </tr>
                {/* Total row */}
                <tr className="bg-gray-50 dark:bg-gray-800/50 font-semibold">
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-50">Final Score</td>
                  <td className="px-4 py-4 text-right text-sm text-gray-500">100</td>
                  <td className="px-4 py-4 text-right text-sm font-mono text-gray-700 dark:text-gray-300">
                    {previousScore?.finalScore.toFixed(2) || '—'}
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-mono text-gray-900 dark:text-gray-50">
                    {currentScore.finalScore.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {renderChange(calculateChange(currentScore.finalScore, previousScore?.finalScore))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-900/30 rounded-lg p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-primary-900 dark:text-primary-100">Score Calculation</h3>
              <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
                Your final score is calculated by summing category points (Research: 40 max, Teaching: 30 max, 
                Administrative: 20 max, Outreach: 10 max) and subtracting any penalties. Outcome thresholds: 
                Outstanding ≥80, Satisfactory ≥60, Improvement Plan &lt;60, Contract Risk &lt;40.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function ScoresPage() {
  return (
    <ProtectedRoute>
      <ScoresContent />
    </ProtectedRoute>
  )
}
