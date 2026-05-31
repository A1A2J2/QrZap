import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import QRGenerator from '@/components/QRGenerator'

export default function GeneratePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    }
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 flex items-center justify-center text-gray-900 dark:text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300 relative isolate">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="relative z-10 w-full max-w-md">
        <QRGenerator />
      </div>
    </div>
  )
}