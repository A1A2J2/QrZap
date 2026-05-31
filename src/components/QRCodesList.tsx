'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import axios from 'axios'
import { getUserTier } from '@/lib/tierCheck'

interface QRCodeData {
  id: string
  original_url: string
  short_code: string
  click_count: number
}

export default function QRCodesList() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [tier, setTier] = useState<string>('free')
  const [rerouteModal, setRerouteModal] = useState<{isOpen: boolean, id: string, currentUrl: string}>({isOpen: false, id: '', currentUrl: ''})
  const [newUrl, setNewUrl] = useState('')

  const fetchQRCodes = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        
      if (error) throw error
      setQrCodes(data || [])

      // Fetch user tier for feature flagging
      const tierData = await getUserTier(user.id)
      if (tierData) setTier(tierData.tier)
    } catch (error) {
      console.error('Error fetching QR codes', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQRCodes()
  }, [fetchQRCodes])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this QR code?')) return
    try {
      await supabase.from('qr_codes').delete().eq('id', id)
      setQrCodes(qrCodes.filter((qr) => qr.id !== id))
    } catch (error) {
      console.error('Error deleting', error)
    }
    setOpenMenuId(null)
  }

  const handleCopy = (shortCode: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || window.location.origin;
    const url = `${baseUrl}/qr/${shortCode}`
    navigator.clipboard.writeText(url)
    alert('Copied to clipboard!')
    setOpenMenuId(null)
  }

  const handleReroute = async (id: string, currentUrl: string) => {
    if (tier === 'free') {
      alert('Please upgrade to Premium to unlock dynamic rerouting.')
      setOpenMenuId(null)
      return
    }
    setNewUrl(currentUrl)
    setRerouteModal({ isOpen: true, id, currentUrl })
    setOpenMenuId(null)
  }

  const submitReroute = async () => {
    if (newUrl && newUrl !== rerouteModal.currentUrl) {
      try {
        await axios.patch('/api/qrcodes/update', { id: rerouteModal.id, original_url: newUrl })
        fetchQRCodes()
        alert('QR Code successfully rerouted!')
      } catch (error) {
        alert('Failed to reroute QR Code.')
      }
    }
    setRerouteModal({ isOpen: false, id: '', currentUrl: '' })
  }

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null)
    window.addEventListener('click', closeMenu)
    return () => window.removeEventListener('click', closeMenu)
  }, [])

  if (loading) return <div className="p-4 text-gray-500 dark:text-gray-400">Loading QR codes...</div>

  return (
    <div className="overflow-x-visible bg-transparent rounded-xl pb-24">
      <table className="min-w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
          <tr>
            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Original URL</th>
            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Short Code</th>
            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Scans</th>
            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
          {qrCodes.map((qr) => (
            <tr key={qr.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-6 py-4 max-w-[200px] sm:max-w-xs truncate text-gray-700 dark:text-gray-300" title={qr.original_url}>{qr.original_url}</td>
              <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/30 rounded inline-block mt-3 ml-6 px-2 py-1">{qr.short_code}</td>
              <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">{qr.click_count}</td>
              <td className="px-6 py-4 relative">
                <div className="flex items-center space-x-3">
                  <button onClick={() => handleCopy(qr.short_code)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors">Copy Link</button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenMenuId(openMenuId === qr.id ? null : qr.id)
                    }} 
                    className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-xl font-bold px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-md transition-colors leading-none"
                  >
                    ...
                  </button>
                </div>
                {openMenuId === qr.id && (
                  <div className="absolute right-8 top-12 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-10 flex flex-col text-left overflow-hidden py-1">
                    <button 
                      onClick={() => handleReroute(qr.id, qr.original_url)} 
                      className={`px-4 py-2 text-sm text-left w-full transition-colors flex items-center justify-between ${tier === 'free' ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                      title={tier === 'free' ? 'Premium Feature' : ''}
                    >
                      <span>Reroute</span>
                      {tier === 'free' && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
                    </button>
                    <button onClick={() => handleDelete(qr.id)} className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 text-left w-full transition-colors">Delete</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {qrCodes.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">No QR codes generated yet.</div>
      )}
      
      {rerouteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Reroute QR Code</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enter the new URL to route this QR code to:</p>
            <input 
              type="url" 
              value={newUrl} 
              onChange={(e) => setNewUrl(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white mb-6"
              placeholder="https://example.com"
            />
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setRerouteModal({ isOpen: false, id: '', currentUrl: '' })} 
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitReroute} 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
