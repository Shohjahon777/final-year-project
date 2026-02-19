/**
 * Loading Spinner Component
 * Professional loading state with size variants
 */

export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    </div>
  )
}

export function LoadingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

export function LoadingBar({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden ${className}`}>
      <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse" style={{ width: '40%' }} />
    </div>
  )
}
