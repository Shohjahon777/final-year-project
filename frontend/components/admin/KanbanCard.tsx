/**
 * Kanban Card - Professional Minimal Design
 * Clean, neutral, business-focused
 */

'use client'

import { useDraggable } from '@dnd-kit/core'
import { AdminSubmission } from '@/lib/api/admin'
import { cn } from '@/lib/utils'
import { GripVertical, Clock, Check, X, Eye } from 'lucide-react'

interface KanbanCardProps {
  submission: AdminSubmission
  onViewSubmission: (submission: AdminSubmission) => void
  isDragging?: boolean
}

const categoryIcons: Record<string, string> = {
  research: '📚',
  teaching: '👨‍🏫',
  admin: '📋',
  outreach: '🤝',
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function KanbanCard({ submission, onViewSubmission, isDragging }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging: isBeingDragged } = useDraggable({
    id: submission._id,
  })

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800',
        'transition-all duration-200 cursor-pointer',
        'hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700',
        'hover:-translate-y-0.5',
        (isDragging || isBeingDragged) && 'opacity-40 shadow-2xl scale-105',
        !isDragging && !isBeingDragged && 'cursor-grab active:cursor-grabbing'
      )}
      onClick={() => !isDragging && !isBeingDragged && onViewSubmission(submission)}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        {...attributes}
        className="absolute left-2 top-2 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-3 h-3 text-gray-400" />
      </div>

      <div className="p-3">
        {/* Header: Category + Points */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{categoryIcons[submission.category] || '📄'}</span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {submission.category}
            </span>
          </div>
          <div className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300">
            {submission.adjustedPoints ?? submission.calculatedPoints}
          </div>
        </div>

        {/* Title */}
        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-50 line-clamp-2 leading-tight mb-2">
          {submission.title}
        </h4>

        {/* Subcategory */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">
          {submission.subcategory.replace(/_/g, ' ')}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-semibold text-gray-600 dark:text-gray-400">
              {submission.userId.firstName[0]}{submission.userId.lastName[0]}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {submission.userId.firstName} {submission.userId.lastName}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(submission.submittedAt)}
          </div>
        </div>
      </div>

      {/* Quick Actions on Hover */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onViewSubmission(submission)
          }}
          className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center hover:border-blue-500 transition-colors"
          title="View details"
        >
          <Eye className="w-3 h-3 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  )
}
