'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'

export default function Home() {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (isAuthenticated) {
      router.replace(user?.role === 'admin' ? '/admin' : '/dashboard')
    } else {
      router.replace('/login')
    }
  }, [isAuthenticated, loading, user?.role, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
