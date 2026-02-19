'use client'

import { useRouter, usePathname } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from './AdminSidebar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { NotificationBell } from '@/components/ui/notification-bell'
import { Button } from '@/components/ui/button'
import { User, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface AdminLayoutProps {
  children: React.ReactNode
  pendingCount?: number
}

// Breadcrumb mapping for admin pages
const breadcrumbLabels: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/submissions': 'Submissions',
  '/admin/penalties': 'Penalties',
  '/admin/scoring': 'Scoring Rules',
  '/admin/reports': 'Reports',
  '/admin/account': 'My account',
}

function Breadcrumbs() {
  const pathname = usePathname()

  const segments = pathname?.split('/').filter(Boolean) || []
  const breadcrumbs: { label: string; path: string }[] = []

  // Build breadcrumbs from path segments
  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    const label = breadcrumbLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1)
    breadcrumbs.push({ label, path: currentPath })
  }

  return (
    <nav className="flex items-center gap-1 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.path} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-gray-900 dark:text-gray-100 font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.path}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}

export function AdminLayout({ children, pendingCount = 0 }: AdminLayoutProps) {
  const router = useRouter()
  const { user, loading: isLoading, isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && mounted) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user?.role !== 'admin') {
        // Redirect non-admin users to faculty dashboard
        router.push('/dashboard')
      }
    }
  }, [isLoading, isAuthenticated, user, router, mounted])

  // Show loading while checking auth
  if (!mounted || isLoading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-950">
        <AdminSidebar pendingCount={pendingCount} />
        <SidebarInset>
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-8">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <Breadcrumbs />
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <ThemeToggle />
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
              <Link href="/admin/account">
                <Button variant="ghost" size="sm" className="gap-2" type="button">
                  <div className="h-8 w-8 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
                    <User className="h-4 w-4 text-danger-600 dark:text-danger-400" />
                  </div>
                  <span className="hidden lg:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                    Admin
                  </span>
                </Button>
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 px-8 py-8">
            <div className="max-w-[1600px] mx-auto">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
