/**
 * Kanban Column Component - Metronic Style
 * Professional, compact, information-dense
 */

'use client'

import { useDroppable } from '@dnd-kit/core'
import { AdminSubmission } from '@/lib/api/admin'
import { KanbanCard } from './KanbanCard'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  id: string
  title: string
  color: string
  bgColor: string
  borderColor: string
  count: number
  submissions: AdminSubmission[]
  onViewSubmission: (submission: AdminSubmission) => void
  isDragging?: boolean
  loading?: boolean
}

export function KanbanColumn({
  id,
  title,
  color,
  bgColor,
  borderColor,
  count,
  submissions,
  onViewSubmission,
  isDragging,
  loading,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div className="flex-shrink-0 w-[250px] flex flex-col">
      {/* Professional Column Header */}
      <div className="mb-2">
        <div className={cn(
          'rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700',
          'transition-all duration-200',
          isOver && 'ring-2 ring-gray-300 dark:ring-gray-600'
        )}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-700 dark:text-gray-300">{title}</h3>
            <div className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-400">
              {count}
            </div>
          </div>
        </div>
      </div>

      {/* Clean Drop Zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-lg p-2 transition-all duration-200 min-h-[calc(100vh-280px)]',
          'bg-gray-50/50 dark:bg-gray-900/30',
          isOver && 'bg-gray-100 dark:bg-gray-800/50 ring-2 ring-gray-300 dark:ring-gray-600',
          isDragging && 'bg-gray-100/50 dark:bg-gray-800/30'
        )}
      >
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <svg className="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xs font-medium">Empty</p>
            </div>
          ) : (
            submissions.map((submission) => (
              <KanbanCard
                key={submission._id}
                submission={submission}
                onViewSubmission={onViewSubmission}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
