'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api/admin'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    // Fetch pending submissions count
    const fetchPendingCount = async () => {
      try {
        const data = await adminApi.getDashboard()
        setPendingCount(data.stats.pendingSubmissions)
      } catch {
        // Fallback to 0 if API fails
        setPendingCount(0)
      }
    }

    fetchPendingCount()

    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return <AdminLayout pendingCount={pendingCount}>{children}</AdminLayout>
}
