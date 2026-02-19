/**
 * Status Badge Component
 * Professional status indicators with consistent styling
 */

import { cn } from '@/lib/utils'
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

type Status = 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'outstanding' | 'satisfactory' | 'improvement_plan' | 'contract_risk'

interface StatusBadgeProps {
  status: Status
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const statusConfig = {
  // Submission statuses
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-900/30 dark:text-yellow-300 dark:ring-yellow-600/30',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-100 text-green-800 ring-green-600/20 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-600/30',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 ring-red-600/20 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-600/30',
    icon: XCircle,
  },
  changes_requested: {
    label: 'Changes Requested',
    className: 'bg-blue-100 text-blue-800 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-600/30',
    icon: AlertCircle,
  },

  // Outcome statuses
  outstanding: {
    label: 'Outstanding',
    className: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-600/30',
    icon: CheckCircle,
  },
  satisfactory: {
    label: 'Satisfactory',
    className: 'bg-green-100 text-green-800 ring-green-600/20 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-600/30',
    icon: CheckCircle,
  },
  improvement_plan: {
    label: 'Improvement Plan',
    className: 'bg-orange-100 text-orange-800 ring-orange-600/20 dark:bg-orange-900/30 dark:text-orange-300 dark:ring-orange-600/30',
    icon: AlertCircle,
  },
  contract_risk: {
    label: 'Contract Risk',
    className: 'bg-red-100 text-red-800 ring-red-600/20 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-600/30',
    icon: XCircle,
  },
}

export function StatusBadge({ status, className = '', size = 'md', showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium ring-1 ring-inset',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  )
}
