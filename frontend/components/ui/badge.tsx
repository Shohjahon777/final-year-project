import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default:
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        primary:
          "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
        success:
          "bg-success-50 text-success-600 dark:bg-success-900/30 dark:text-success-400",
        warning:
          "bg-warning-50 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400",
        danger:
          "bg-danger-50 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400",
        info:
          "bg-info-50 text-info-600 dark:bg-info-900/30 dark:text-info-400",
        outline:
          "border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
