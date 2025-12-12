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
  useSidebar,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Users,
  FileText,
  AlertTriangle,
  Settings,
  BarChart3,
  LogOut,
  Shield,
} from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  badge?: string | number
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Users', path: '/admin/users', icon: <Users className="h-4 w-4" /> },
  { label: 'Submissions', path: '/admin/submissions', icon: <FileText className="h-4 w-4" /> },
  { label: 'Penalties', path: '/admin/penalties', icon: <AlertTriangle className="h-4 w-4" /> },
  { label: 'Scoring Rules', path: '/admin/scoring', icon: <Settings className="h-4 w-4" /> },
  { label: 'Reports', path: '/admin/reports', icon: <BarChart3 className="h-4 w-4" /> },
]

interface AdminSidebarProps {
  pendingCount?: number
}

export function AdminSidebar({ pendingCount = 0 }: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { setOpen } = useSidebar()
  const { user, logout } = useAuth()

  const handleNavigation = (path: string) => {
    router.push(path)
    // Close sidebar on mobile after navigation
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Add badge to submissions if there are pending items
  const navItemsWithBadges = navItems.map((item) => {
    if (item.path === '/admin/submissions' && pendingCount > 0) {
      return { ...item, badge: pendingCount }
    }
    return item
  })

  return (
    <Sidebar side="left">
      <SidebarHeader>
        <div className="flex items-center gap-3 w-full px-2">
          <div className="h-9 w-9 rounded-lg bg-danger-600 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              Admin Panel
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Faculty Evaluation
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Navigation Label */}
        <div className="px-4 py-2">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Management
          </span>
        </div>

        <SidebarMenu>
          {navItemsWithBadges.map((item) => {
            // For exact /admin, only match exactly. For other paths, match prefix too.
            const isActive =
              item.path === '/admin'
                ? pathname === '/admin'
                : pathname === item.path || pathname?.startsWith(item.path + '/')
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-auto text-xs bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>

        {/* Quick Actions */}
        <div className="px-4 py-2 mt-4">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Quick Actions
          </span>
        </div>
        <div className="px-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => router.push('/dashboard')}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Faculty Dashboard</span>
          </Button>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          {/* User Profile */}
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center text-danger-600 dark:text-danger-400 font-medium text-sm">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-danger-600 dark:text-danger-400 capitalize truncate">
                Administrator
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
