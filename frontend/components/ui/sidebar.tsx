'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SidebarContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function SidebarProvider({ children, defaultOpen }: SidebarProviderProps) {
  // Default to open on desktop, closed on mobile
  const [open, setOpen] = React.useState(() => {
    if (defaultOpen !== undefined) return defaultOpen
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 // md breakpoint
    }
    return true // SSR default
  })

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && !open) {
        setOpen(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [open])

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right'
  variant?: 'default' | 'inset'
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, side = 'left', variant = 'default', ...props }, ref) => {
    const { open } = useSidebar()

    return (
      <div
        ref={ref}
        data-side={side}
        data-variant={variant}
        className={cn(
          'fixed md:sticky top-0 z-40 h-screen',
          'w-60 transition-transform duration-200',
          'bg-white border-r border-gray-200 bg-mesh-grid',
          'dark:bg-gray-950 dark:border-gray-800',
          'flex flex-col',
          side === 'left' && 'left-0',
          side === 'right' && 'right-0',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          className
        )}
        {...props}
      />
    )
  }
)
Sidebar.displayName = 'Sidebar'

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex h-16 shrink-0 items-center gap-2 px-6', className)}
    {...props}
  />
))
SidebarHeader.displayName = 'SidebarHeader'

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 min-h-0 overflow-y-auto px-4 py-2 scrollbar-hide', className)}
    {...props}
  />
))
SidebarContent.displayName = 'SidebarContent'

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex shrink-0 items-center gap-2 px-4 py-3', className)}
    {...props}
  />
))
SidebarFooter.displayName = 'SidebarFooter'

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('space-y-0.5', className)}
    {...props}
  />
))
SidebarMenu.displayName = 'SidebarMenu'

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('', className)}
    {...props}
  />
))
SidebarMenuItem.displayName = 'SidebarMenuItem'

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left text-sm',
        'hover:bg-gray-100 dark:hover:bg-slate-800',
        isActive && 'bg-gray-100 text-gray-900 font-medium dark:bg-slate-800 dark:text-slate-50',
        !isActive && 'text-gray-600 dark:text-slate-400',
        className
      )}
      {...props}
    />
  )
)
SidebarMenuButton.displayName = 'SidebarMenuButton'

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { open, setOpen } = useSidebar()

  return (
    <button
      ref={ref}
      onClick={() => setOpen(!open)}
      className={cn(
        'p-2 rounded-md hover:bg-muted dark:hover:bg-slate-800 transition-colors',
        className
      )}
      {...props}
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  )
})
SidebarTrigger.displayName = 'SidebarTrigger'

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950', className)}
    {...props}
  />
))
SidebarInset.displayName = 'SidebarInset'

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
}
