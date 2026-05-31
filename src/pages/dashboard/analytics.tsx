import Link from 'next/link';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import axios from 'axios'
import { supabase } from '@/lib/supabase';
import CountryAnalytics from '@/components/CountryAnalytics'
import { getUserTier } from '@/lib/tierCheck'

export default function AnalyticsPage() {
  const [qrCodes, setQrCodes] = useState([])
  const [loading, setLoading] = useState(true);
  const [hourLabel, setHourLabel] = useState("")
  const [tier, setTier] = useState<string>('free')

  useEffect(() => {
    fetchAnalytics()
    
    // Dynamically calculate current 1-hour block (e.g. 5:00 PM - 6:00 PM)
    const updateTimeLabel = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const nextHour = currentHour + 1;
      
      const formatH = (h: number) => {
        let adjusted = h % 24;
        const ampm = adjusted >= 12 ? 'PM' : 'AM';
        const hour12 = adjusted % 12 || 12;
        return `${hour12}:00 ${ampm}`;
      };
      
      setHourLabel(`${formatH(currentHour)} - ${formatH(nextHour)}`);
    };
    
    updateTimeLabel();
    const interval = setInterval(() => {
      updateTimeLabel();
      fetchAnalytics(); // Live-update the graphs when clicked!
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [])


  const fetchAnalytics = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const tierData = await getUserTier(user.id)
    if (tierData) setTier(tierData.tier)

    try {
      const res = await axios.get(`/api/qrcodes/analytics?user_id=${user.id}`)
      
      const now = new Date()
      const currentHourStart = new Date(now)
      currentHourStart.setMinutes(0, 0, 0) // setMinutes only takes up to 3 arguments
      
      const startOfDay = new Date(now)
      startOfDay.setHours(0, 0, 0, 0)

      const formatTime = (d: Date) => {
        const ampm = d.getHours() >= 12 ? 'PM' : 'AM'
        const hour12 = d.getHours() % 12 || 12
        const min = d.getMinutes().toString().padStart(2, '0')
        return `${hour12}:${min} ${ampm}`
      }

      const formatHour = (h: number) => {
        if (h === 24) return '12:00 AM'
        const ampm = h >= 12 ? 'PM' : 'AM'
        const hour12 = h % 12 || 12
        return `${hour12}:00 ${ampm}`
      }

      const processedData = res.data.map((qr: any) => {
        const todayMap = new Map<number, number>()
        for (let i = 1; i <= 24; i++) todayMap.set(i, 0)

        const lastHourMap = new Map<string, number>()
        for (let i = 0; i < 60; i++) lastHourMap.set(formatTime(new Date(currentHourStart.getTime() + i * 60000)), 0)

        qr.raw_clicks?.forEach((clickedAt: string) => {
          // Force UTC parsing if Supabase returns timestamp without timezone indicator
          const clickTime = new Date(clickedAt + (clickedAt.includes('Z') || clickedAt.includes('+') ? '' : 'Z'))
          
          if (clickTime >= startOfDay) {
            const bucket = clickTime.getHours() === 0 ? 24 : clickTime.getHours()
            if (todayMap.has(bucket)) todayMap.set(bucket, todayMap.get(bucket)! + 1)
          }
          if (clickTime >= currentHourStart && clickTime < new Date(currentHourStart.getTime() + 3600000)) {
            const timeStr = formatTime(clickTime)
            if (lastHourMap.has(timeStr)) lastHourMap.set(timeStr, lastHourMap.get(timeStr)! + 1)
          }
        })

        return {
          ...qr,
          todayData: Array.from(todayMap.entries()).map(([hour, count]) => ({ time: formatHour(hour), clicks: count })),
          lastHourData: Array.from(lastHourMap.entries()).map(([minute, count]) => ({ minute, clicks: count }))
        }
      })

      setQrCodes(processedData)
    } catch (error) {
      console.error('Failed to fetch analytics', error)
    } finally {
      setLoading(false)
    }
  }

  const isFree = tier === 'free'

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading analytics...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 py-8 transition-colors duration-300 relative isolate">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      {/* max-w-[1600px] allows it to stretch wider to fit horizontal grids */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 grid grid-cols-1 gap-12 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">QR Analytics</h1>
          <a href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">← Back to Dashboard</a>
        </div>
        
        {qrCodes.map((qr: any) => (
          <div key={qr.id} id={`qr-card-${qr.id}`} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-gray-200 dark:border-slate-800 p-6">
            {/* Top Section: Website Link */}
            <div className="mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Destination URL</h2>
              <a href={qr.original_url} target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors break-all">
                {qr.original_url}
              </a>
            </div>

            {/* Wrap container spreads elements horizontally */}
            <div className="flex flex-wrap gap-6 items-center">
              {/* Left Side: QR Code and Total Clicks */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-48 border border-slate-100 dark:border-slate-800 shrink-0">
                <div className="bg-white p-2 rounded-xl shadow-sm mb-3 border border-gray-100 dark:border-slate-700">
                  <QRCodeSVG value={qr.qr_data || qr.original_url} size={120} />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3 font-medium text-xs break-all text-center">
                  Code: <span className="font-mono text-gray-900 dark:text-gray-200 bg-white dark:bg-slate-800 px-1 py-0.5 rounded shadow-sm border border-gray-200 dark:border-slate-700">{qr.short_code}</span>
                </p>
                <div className="text-center w-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Total Clicks</p>
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{qr.click_count}</p>
                </div>
              </div>

              {/* Graph 1: Scans Today (Small Block) */}
              <div className="flex flex-col w-56 h-56 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-gray-100 dark:border-slate-800 rounded-xl p-3 shadow-sm shrink-0">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Today (Last 24h)
                </h4>
                {/* Hardcoding width & height entirely bypasses the ResponsiveContainer -1 bugs */}
                <div className="w-full h-40 flex items-center justify-center overflow-hidden">
                  <LineChart width={200} height={160} data={qr.todayData || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="time" fontSize={9} tickMargin={5} stroke="#94a3b8" minTickGap={20} />
                      <YAxis allowDecimals={false} fontSize={9} stroke="#94a3b8" width={20} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', padding: '4px 8px' }} />
                      <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2, fill: '#3b82f6' }} activeDot={{ r: 4 }} />
                    </LineChart>
                </div>
              </div>
            </div>

            {/* Premium Analytics Section */}
            <div className="relative mt-6">
              <div className={`space-y-6 transition-all duration-500 ${isFree ? 'blur-[8px] pointer-events-none select-none opacity-40 grayscale-[50%]' : ''}`}>
                
                {/* Graph 2: Scans Last Hour (Small Block) */}
                <div className="flex flex-col w-56 h-56 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-gray-100 dark:border-slate-800 rounded-xl p-3 shadow-sm shrink-0">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-1.5 text-xs whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    {hourLabel}
                  </h4>
                  {/* Hardcoding width & height entirely bypasses the ResponsiveContainer -1 bugs */}
                  <div className="w-full h-40 flex items-center justify-center overflow-hidden">
                    <LineChart width={200} height={160} data={qr.lastHourData || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="minute" fontSize={9} tickMargin={5} stroke="#94a3b8" minTickGap={20} />
                        <YAxis allowDecimals={false} fontSize={9} stroke="#94a3b8" width={20} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', padding: '4px 8px' }} />
                        <Line type="monotone" dataKey="clicks" stroke="#a855f7" strokeWidth={2} dot={{ r: 2, fill: '#a855f7' }} activeDot={{ r: 4 }} />
                      </LineChart>
                  </div>
                </div>

                {/* Per-QR Code Country Analytics */}
                <CountryAnalytics qrCodeId={qr.id} />
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
                    Unlock advanced analytics, live hour tracking, and data exports.
                  </p>
                  <Link href="/pricing" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                    Upgrade to Unlock
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}

        {qrCodes.length === 0 && (
          <div className="text-center p-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-gray-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No QR Codes Yet</h3>
          </div>
        )}
      </div>

    </div>
  );
}