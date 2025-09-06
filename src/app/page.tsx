'use client'

import { AppLayout } from '@/components/AppLayout'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to items page on load
    router.push('/items')
  }, [router])

  return (
    <AppLayout>
      <div>Loading...</div>
    </AppLayout>
  )
}
