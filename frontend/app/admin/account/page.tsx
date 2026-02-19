'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { User, Mail, Shield, KeyRound } from 'lucide-react'

export default function AdminAccountPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Command Profile</h1>
        <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-wide font-medium mt-0.5">
          Administrator Account
        </p>
      </div>

      {/* Hero Profile Card */}
      <div className="relative overflow-hidden rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-950/25 p-6 shadow-sm">
        {/* Subtle glow for dark mode only */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 dark:from-blue-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-4">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/30 border border-blue-400/30 flex-shrink-0">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {user.firstName} {user.lastName}
              </h2>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30">
                Admin
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-sm mb-2">
              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span className="font-mono text-xs">{user.email}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-lg shadow-emerald-400/50" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wide font-medium">Active Session</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Access Panel */}
      <div className="rounded-xl border border-gray-200 dark:border-slate-800/50 bg-white dark:bg-gray-900/50 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center">
            <KeyRound className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">Security & Access</h2>
        </div>

        <div className="space-y-2">
          {/* Change Password */}
          <Link href="/change-password">
            <div className="group flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700/50 hover:bg-amber-50 dark:hover:bg-slate-800/40 hover:border-amber-300 dark:hover:border-amber-500/30 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-colors">
                  <KeyRound className="h-4 w-4 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white tracking-tight">Change Password</p>
                  <p className="text-[9px] text-gray-400 dark:text-slate-500">Update authentication credentials</p>
                </div>
              </div>
              <div className="text-gray-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">→</div>
            </div>
          </Link>

          {/* Access Level */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/20 border border-gray-200 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white tracking-tight">Access Level</p>
                <p className="text-[9px] text-gray-400 dark:text-slate-500">Full system administrator</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
              Full
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="rounded-xl border border-gray-200 dark:border-slate-800/50 bg-white dark:bg-gray-900/50 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Manage Users', sub: 'View all faculty', path: '/admin/users' },
            { label: 'Penalties', sub: 'Review violations', path: '/admin/penalties' },
            { label: 'Analytics', sub: 'Performance data', path: '/admin/reports' },
            { label: 'Config', sub: 'Scoring rules', path: '/admin/scoring' },
          ].map(({ label, sub, path }) => (
            <button
              key={path}
              onClick={() => router.push(path)}
              className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700/50 hover:bg-violet-50 dark:hover:bg-slate-800/40 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all duration-200 text-left"
            >
              <div className="text-xs font-semibold text-gray-900 dark:text-white tracking-tight mb-0.5">{label}</div>
              <div className="text-[9px] text-gray-400 dark:text-slate-500">{sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
