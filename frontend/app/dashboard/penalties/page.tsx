'use client'

import { useState } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockPenalties } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { 
  AlertTriangle, 
  Calendar,
  ChevronDown,
  Clock,
  FileText,
  Filter,
  Info,
  Users
} from 'lucide-react'

// Penalty type configurations
const penaltyTypes = {
  meeting: { label: 'Meeting Absence', icon: Users, color: 'text-warning-600' },
  deadline: { label: 'Late Submission', icon: Clock, color: 'text-danger-600' },
  conduct: { label: 'Professional Conduct', icon: FileText, color: 'text-danger-600' },
  other: { label: 'Other', icon: AlertTriangle, color: 'text-gray-600' },
}

function PenaltiesContent() {
  const [selectedYear, setSelectedYear] = useState('2024-2025')
  const [filterType, setFilterType] = useState('')

  // Filter penalties by year and type
  const filteredPenalties = mockPenalties.filter(p => {
    const yearMatch = p.academicYear === selectedYear
    const typeMatch = !filterType || p.type === filterType
    return yearMatch && typeMatch
  })

  // Calculate total penalties
  const totalPenalties = filteredPenalties.reduce((sum, p) => sum + Math.abs(p.points), 0)

  const getPenaltyConfig = (type: string) => {
    return penaltyTypes[type as keyof typeof penaltyTypes] || penaltyTypes.other
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
              Penalties
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View penalties applied to your evaluation score
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
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Total Penalties */}
          <div className="bg-danger-50 dark:bg-danger-900/10 border border-danger-200 dark:border-danger-900/30 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-danger-100 dark:bg-danger-900/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-danger-600" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-danger-600 dark:text-danger-400">
                  Total Deductions
                </div>
                <div className="text-2xl font-bold font-mono text-danger-700 dark:text-danger-300">
                  -{totalPenalties.toFixed(2)} pts
                </div>
              </div>
            </div>
          </div>

          {/* Number of Penalties */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Penalties Applied
                </div>
                <div className="text-2xl font-bold font-mono text-gray-900 dark:text-gray-50">
                  {filteredPenalties.length}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Year */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Academic Year
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                  {selectedYear}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Filter by type:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('')}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                !filterType 
                  ? "bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              )}
            >
              All
            </button>
            {Object.entries(penaltyTypes).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  filterType === key 
                    ? "bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                )}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Penalties List */}
        {filteredPenalties.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-success-100 dark:bg-success-900/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-success-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-1">No penalties found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filterType ? 'No penalties match the selected filter' : 'You have no penalties for this academic year'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <div className="border-l-4 border-l-danger-500">
              {filteredPenalties.map((penalty, index) => {
                const config = getPenaltyConfig(penalty.type)
                const IconComponent = config.icon
                
                return (
                  <div 
                    key={penalty._id}
                    className={cn(
                      "p-5",
                      index !== filteredPenalties.length - 1 && "border-b border-gray-100 dark:border-gray-800"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center flex-shrink-0">
                          <IconComponent className={cn("h-5 w-5", config.color)} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                            {penalty.description}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="danger">{config.label}</Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Applied on {new Date(penalty.appliedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold font-mono text-danger-600">
                          -{Math.abs(penalty.points)} pts
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Penalty Types Info */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
            Penalty Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-warning-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-50">Meeting Absence</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Penalties for missing required department meetings, committee meetings, or mandatory faculty gatherings.
              </p>
              <div className="mt-3 text-xs text-gray-500">
                Typical deduction: <span className="font-mono font-medium">1-3 pts</span> per occurrence
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-danger-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-50">Late Submission</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Penalties for submitting required documents, grades, or reports after the deadline.
              </p>
              <div className="mt-3 text-xs text-gray-500">
                Typical deduction: <span className="font-mono font-medium">2-5 pts</span> based on delay
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-5 w-5 text-danger-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-50">Professional Conduct</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Penalties related to professional conduct violations or failure to meet faculty responsibilities.
              </p>
              <div className="mt-3 text-xs text-gray-500">
                Typical deduction: <span className="font-mono font-medium">5-10 pts</span> based on severity
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-50">Other</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Other administrative penalties not covered by the categories above.
              </p>
              <div className="mt-3 text-xs text-gray-500">
                Typical deduction: <span className="font-mono font-medium">Varies</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-900/30 rounded-lg p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-primary-900 dark:text-primary-100">About Penalties</h3>
              <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
                Penalties are deducted from your total points before calculating your final score. 
                If you believe a penalty was applied in error, please contact your department administrator 
                or submit an appeal through the appropriate channels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function PenaltiesPage() {
  return (
    <ProtectedRoute>
      <PenaltiesContent />
    </ProtectedRoute>
  )
}
