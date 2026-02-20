'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Users,
  FileText,
  AlertTriangle,
  Settings as SettingsIcon,
  BarChart3,
  LogOut,
  User,
  Settings,
  CalendarDays,
} from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface NavItem {
  label: string
  path: string
  icon: any
  badge?: string | number
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Submissions', path: '/admin/submissions', icon: FileText },
  { label: 'Vacations', path: '/admin/vacations', icon: CalendarDays },
  { label: 'Penalties', path: '/admin/penalties', icon: AlertTriangle },
  { label: 'Scoring', path: '/admin/scoring', icon: SettingsIcon },
  { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { label: 'Account', path: '/admin/account', icon: User },
]

interface AdminSidebarProps {
  pendingCount?: number
}

export function AdminSidebar({ pendingCount = 0 }: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { setOpen } = useSidebar()
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleNavigation = (path: string) => {
    router.push(path)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navItemsWithBadges = navItems.map((item) => {
    if (item.path === '/admin/submissions' && pendingCount > 0) {
      return { ...item, badge: pendingCount }
    }
    return item
  })

  return (
    <Sidebar
      side="left"
      className="border-r border-gray-200/80 dark:border-slate-800/50 bg-white dark:bg-gradient-to-b dark:from-slate-950 dark:to-slate-900"
    >
      {/* Floating Glass Header */}
      <SidebarHeader className="p-4 border-b border-gray-200/80 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center">
            {mounted && (
              <Image
                src={theme === 'dark' ? '/engineering-white.png' : '/engineering.png'}
                alt="Engineering Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
              Admin Panel
            </span>
            <span className="text-[10px] tracking-wide text-gray-500 dark:text-slate-400 uppercase font-medium">
              Management View
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {/* Nav Label */}
        <div className="px-3 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">
            Navigation
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-0.5">
          {navItemsWithBadges.map((item) => {
            const Icon = item.icon
            const isActive =
              item.path === '/admin'
                ? pathname === '/admin'
                : pathname === item.path || pathname?.startsWith(item.path + '/')

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  'group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-gray-900 dark:text-white bg-gradient-to-r from-blue-500/10 to-transparent shadow-sm dark:shadow-lg dark:shadow-blue-500/10'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-slate-800/50'
                )}
              >
                {/* Active Left Border */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/50" />
                )}

                {/* Icon */}
                <div className={cn(
                  'flex items-center justify-center transition-all duration-200',
                  isActive && 'text-blue-600 dark:text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                )}>
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </div>

                {/* Label */}
                <span className={cn(
                  'flex-1 text-left tracking-tight',
                  isActive ? 'font-semibold' : 'font-medium'
                )}>
                  {item.label}
                </span>

                {/* Badge */}
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30">
                    {item.badge}
                  </span>
                )}

                {/* Hover Effect */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-gray-100/50 dark:from-slate-700/20 to-transparent" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-800 to-transparent my-4" />

        {/* Quick Switch to Faculty View */}
        <button
          onClick={() => router.push('/dashboard')}
          className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-slate-800/50 transition-all duration-200"
        >
          <LayoutDashboard className="h-[18px] w-[18px]" strokeWidth={1.5} />
          <span className="flex-1 text-left tracking-tight">Faculty View</span>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-lg shadow-emerald-400/50" />
        </button>
      </SidebarContent>

      {/* User Footer */}
      <SidebarFooter className="p-3 border-t border-gray-200/80 dark:border-slate-800/50">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-50/80 dark:bg-slate-800/30 backdrop-blur-sm border border-gray-200/80 dark:border-slate-700/50">
          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/30 flex-shrink-0">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-900 dark:text-white truncate tracking-tight">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 truncate font-medium uppercase tracking-wide">
              Admin
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push('/admin/account')}
              className="h-7 w-7 rounded-md flex items-center justify-center text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-slate-700/50 transition-all duration-200"
              aria-label="Settings"
            >
              <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <button
              onClick={handleLogout}
              className="h-7 w-7 rounded-md flex items-center justify-center text-gray-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
              aria-label="Log out"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
