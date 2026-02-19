/**
 * Empty State Component
 * Friendly empty states with icons and optional actions
 */

import { FileText, LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = FileText,
  title = "No data yet",
  description = "Get started by creating your first item",
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-sm">
        {description}
      </p>
      {action}
    </div>
  )
}

export function EmptyStateInline({
  icon: Icon = FileText,
  message = "No items found",
  className = '',
}: {
  icon?: LucideIcon
  message?: string
  className?: string
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-8 px-4 ${className}`}>
      <Icon className="w-8 h-8 text-gray-400 mb-2" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  )
}
