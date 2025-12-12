'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { LayoutDashboard, FileText, TrendingUp, AlertCircle, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  badge?: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Submissions', path: '/dashboard/submissions', icon: <FileText className="h-4 w-4" /> },
  { label: 'Scores', path: '/dashboard/scores', icon: <TrendingUp className="h-4 w-4" /> },
  { label: 'Penalties', path: '/dashboard/penalties', icon: <AlertCircle className="h-4 w-4" /> },
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { setOpen } = useSidebar()
  const { user, logout } = useAuth()

  const handleNavigation = (path: string) => {
    router.push(path)
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <Sidebar side="left">
      <SidebarHeader>
        <div className="flex items-center gap-3 w-full px-2">
          <div className="h-9 w-9 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">CAU</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              Faculty Evaluation
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              System
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Navigation Label */}
        <div className="px-4 py-2">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Navigation
          </span>
        </div>

        <SidebarMenu>
          {navItems.map((item) => {
            // For exact /dashboard, only match exactly. For other paths, match prefix too.
            const isActive = item.path === '/dashboard' 
              ? pathname === '/dashboard'
              : pathname === item.path || pathname?.startsWith(item.path + '/')
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-2 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          {/* User Profile */}
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                {user?.role}
              </div>
            </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
