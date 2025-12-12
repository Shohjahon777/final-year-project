'use client'

import { usePathname } from 'next/navigation'
import { SidebarProvider, SidebarTrigger, SidebarInset, useSidebar } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Button } from '@/components/ui/button'
import { ChevronRight, Search, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { NotificationBell } from '@/components/ui/notification-bell'
import { cn } from '@/lib/utils'

function MobileOverlay() {
  const { open, setOpen } = useSidebar()
  
  if (!open) return null
  
  return (
    <div
      className="fixed inset-0 bg-black/50 z-30 md:hidden"
      onClick={() => setOpen(false)}
    />
  )
}

function Breadcrumbs() {
  const pathname = usePathname()
  const paths = pathname?.split('/').filter(Boolean) || []
  
  return (
    <nav className="flex items-center text-sm">
      <span className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">Home</span>
      {paths.map((path, index) => (
        <div key={path} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
          <span className={cn(
            "cursor-pointer",
            index === paths.length - 1 
              ? "text-gray-900 dark:text-gray-50 font-medium" 
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          )}>
            {path.charAt(0).toUpperCase() + path.slice(1)}
          </span>
        </div>
      ))}
    </nav>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="flex">
          <AppSidebar />
          <MobileOverlay />

          {/* Main Content */}
          <SidebarInset>
            {/* Top Navigation Bar - 64px height */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-8">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <Breadcrumbs />
              </div>
              
              {/* Right side actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <Search className="h-5 w-5" />
                </Button>
                <NotificationBell />
                <ThemeToggle />
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="hidden lg:inline text-sm font-medium text-gray-700 dark:text-gray-300">Faculty</span>
                </Button>
              </div>
            </header>
            
            {/* Main content area with proper padding */}
            <main className="flex-1 px-8 py-8">
              <div className="max-w-[1600px] mx-auto">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}
