'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getUserTier } from '@/lib/tierCheck'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import axios from 'axios'

export default function AnalyticsDashboard() {
  const [tier, setTier] = useState<string>('free')
  const [graphData, setGraphData] = useState<any[]>([])
  const [hourGraphData, setHourGraphData] = useState<any[]>([])
  const [hourLabel, setHourLabel] = useState("")

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      try {
        const tierData = await getUserTier(user.id)
        if (tierData) setTier(tierData.tier)

        // Fetch analytics for all QR codes to aggregate total 24h clicks
        const res = await axios.get(`/api/qrcodes/analytics?user_id=${user.id}`)
        
        const now = new Date()
        
        // 24H Graph Setup
        const startOfDay = new Date(now)
        startOfDay.setHours(0, 0, 0, 0)
        const todayMap = new Map<number, number>()
        for (let i = 1; i <= 24; i++) todayMap.set(i, 0)
        
        // 1H Graph Setup
        const currentHourStart = new Date(now)
        currentHourStart.setMinutes(0, 0, 0)
        const lastHourMap = new Map<string, number>()
        const formatTime = (d: Date) => {
          const ampm = d.getHours() >= 12 ? 'PM' : 'AM'
          const hour12 = d.getHours() % 12 || 12
          const min = d.getMinutes().toString().padStart(2, '0')
          return `${hour12}:${min} ${ampm}`
        }
        for (let i = 0; i < 60; i++) lastHourMap.set(formatTime(new Date(currentHourStart.getTime() + i * 60000)), 0)

        const qrIds: string[] = []

        res.data.forEach((qr: any) => {
          qrIds.push(qr.id)
          qr.raw_clicks?.forEach((clickedAt: string) => {
            const clickTime = new Date(clickedAt + (clickedAt.includes('Z') || clickedAt.includes('+') ? '' : 'Z'))
            if (clickTime >= startOfDay) {
              const bucket = clickTime.getHours() === 0 ? 24 : clickTime.getHours()
              todayMap.set(bucket, (todayMap.get(bucket) || 0) + 1)
            }
            if (clickTime >= currentHourStart && clickTime < new Date(currentHourStart.getTime() + 3600000)) {
              const timeStr = formatTime(clickTime)
              if (lastHourMap.has(timeStr)) lastHourMap.set(timeStr, lastHourMap.get(timeStr)! + 1)
            }
          })
        })

        const formatHour = (h: number) => {
          if (h === 24) return '12 AM'
          const ampm = h >= 12 ? 'PM' : 'AM'
          const hour12 = h % 12 || 12
          return `${hour12} ${ampm}`
        }

        const aggregated = Array.from(todayMap.entries()).map(([hour, count]) => ({
          time: formatHour(hour),
          scans: count
        }))
        
        setGraphData(aggregated)
        setHourGraphData(Array.from(lastHourMap.entries()).map(([minute, count]) => ({ minute, scans: count })))

        // Set Hour Label
        const currentHour = now.getHours()
        const nextHour = currentHour + 1
        const formatH = (h: number) => {
          let adjusted = h % 24
          const ampm = adjusted >= 12 ? 'PM' : 'AM'
          const hour12 = adjusted % 12 || 12
          return `${hour12}:00 ${ampm}`
        }
        setHourLabel(`${formatH(currentHour)} - ${formatH(nextHour)}`)

      } catch (error) {
        console.error('Error fetching dashboard data', error)
      }
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const isFree = tier === 'free'

  return (
    <div className="space-y-8 mt-8">
      <h2 className="text-2xl font-bold">Analytics</h2>
      
      {/* 24-Hour Graph (Visible to Everyone) */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <h3 className="text-lg font-bold mb-4 dark:text-white">Time Graph (24h)</h3>
        <div className="h-48 w-full">
          {graphData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={graphData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="time" fontSize={10} tickMargin={8} stroke="#94a3b8" minTickGap={20} />
                <YAxis allowDecimals={false} fontSize={10} stroke="#94a3b8" width={30} />
                <Tooltip formatter={(value: any) => [value, 'Scans']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '12px', padding: '8px' }} />
                <Line type="monotone" dataKey="scans" stroke="#3b82f6" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 5, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-gradient-to-b from-blue-50 to-white dark:from-slate-700/50 dark:to-slate-800 rounded-lg flex items-center justify-center text-blue-400 border border-blue-100/50 dark:border-slate-600 font-medium border-dashed">
              Loading Data...
            </div>
          )}
        </div>
      </div>

      {/* Premium Analytics Section */}
      <div className="relative">
        <div id="premium-analytics-container" className={`space-y-6 transition-all duration-500 ${isFree ? 'blur-[8px] pointer-events-none select-none opacity-40 grayscale-[50%]' : ''}`}>
          
          {/* 1-Hour Graph */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
            <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Live Hour Tracking ({hourLabel || '...'})
            </h3>
            <div className="h-48 w-full">
              {hourGraphData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={hourGraphData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                    <XAxis dataKey="minute" fontSize={10} tickMargin={8} stroke="#94a3b8" minTickGap={20} />
                    <YAxis allowDecimals={false} fontSize={10} stroke="#94a3b8" width={30} />
                    <Tooltip formatter={(value: any) => [value, 'Scans']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '12px', padding: '8px' }} />
                    <Line type="monotone" dataKey="scans" stroke="#a855f7" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 5, fill: '#a855f7' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-gradient-to-b from-purple-50 to-white dark:from-slate-700/50 dark:to-slate-800 rounded-lg flex items-center justify-center text-purple-400 border border-purple-100/50 dark:border-slate-600 font-medium border-dashed">
                  Loading Hour Data...
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isFree && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/50 backdrop-blur-md rounded-xl border border-white/20 dark:border-slate-700/50 shadow-2xl">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-md mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-indigo-600 dark:text-indigo-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 drop-shadow-sm">Premium Feature</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-sm font-medium">
              Unlock advanced analytics, data exports, and more.
            </p>
            <Link href="/pricing" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5">
              Upgrade to Unlock
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}