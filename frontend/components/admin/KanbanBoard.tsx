/**
 * Kanban Board Component
 * Professional drag-and-drop board for submission management
 */

'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { AdminSubmission } from '@/lib/api/admin'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'

interface KanbanBoardProps {
  submissions: AdminSubmission[]
  onStatusChange: (submissionId: string, newStatus: string) => Promise<void>
  onViewSubmission: (submission: AdminSubmission) => void
  loading?: boolean
}

const columns = [
  {
    id: 'pending',
    title: 'To Review',
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-200 dark:border-gray-800',
  },
  {
    id: 'approved',
    title: 'Approved',
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-200 dark:border-gray-800',
  },
  {
    id: 'rejected',
    title: 'Rejected',
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-200 dark:border-gray-800',
  },
  {
    id: 'changes_requested',
    title: 'Needs Changes',
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-200 dark:border-gray-800',
  },
]

export function KanbanBoard({ submissions, onStatusChange, onViewSubmission, loading }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setIsDragging(true)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setIsDragging(false)

    if (!over) return

    const submissionId = active.id as string
    const newStatus = over.id as string

    // Find the submission
    const submission = submissions.find(s => s._id === submissionId)
    if (!submission) return

    // Check if status actually changed
    if (submission.status === newStatus) return

    // Call the status change handler
    try {
      await onStatusChange(submissionId, newStatus)
    } catch (err) {
      console.error('Failed to update submission status:', err)
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setIsDragging(false)
  }

  const activeSubmission = activeId ? submissions.find(s => s._id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="h-full flex gap-2 overflow-x-auto pb-2 px-0">
        {columns.map((column) => {
          const columnSubmissions = submissions.filter(s => s.status === column.id)
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              bgColor={column.bgColor}
              borderColor={column.borderColor}
              count={columnSubmissions.length}
              submissions={columnSubmissions}
              onViewSubmission={onViewSubmission}
              isDragging={isDragging}
              loading={loading}
            />
          )
        })}
      </div>

      {/* Drag Overlay - shows the card being dragged */}
      <DragOverlay>
        {activeSubmission && (
          <div className="rotate-3 scale-105 opacity-90">
            <KanbanCard
              submission={activeSubmission}
              onViewSubmission={onViewSubmission}
              isDragging
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
