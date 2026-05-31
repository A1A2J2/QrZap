import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '@/lib/supabase'
import axios from 'axios'
import UpgradePrompt from './UpgradePrompt'
import { getUserTier, canGenerateQR, incrementQRCount } from '@/lib/tierCheck'

export default function QRGenerator() {
  const [url, setUrl] = useState('')
  const [qrData, setQrData] = useState('')
  const [shortCode, setShortCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Tier Tracking State
  const [tier, setTier] = useState('free')
  const [qrCount, setQrCount] = useState(0)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  useEffect(() => {
    loadTierData()
  }, [])

  const loadTierData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const tierData = await getUserTier(user.id)
      setTier(tierData.tier || 'free')
      setQrCount(tierData.qr_code_count || 0)
    }
  }

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8)
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('URL must start with http:// or https://')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in')
      return
    }

    // 1. Check if the user is allowed to generate more QR codes
    const check = await canGenerateQR(user.id)
    if (!check.allowed) {
      setShowUpgradePrompt(true)
      return
    }

    const newShortCode = generateShortCode()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || window.location.origin;
    const shortUrl = `${baseUrl}/qr/${newShortCode}`

    setQrData(shortUrl)
    setShortCode(newShortCode)
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('/api/qrcodes/create', {
        original_url: url,
        short_code: newShortCode,
        qr_data: shortUrl,
      })

      if (response.data.error) {
        setError(response.data.error)
      } else {
        // 2. Automatically increment their count and reload the progress bar
        await incrementQRCount(user.id)
        await loadTierData()
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save QR code')
    }
    setLoading(false)
  }

  const downloadQR = () => {
    if (!qrData) return
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      if(ctx) {
         ctx.fillStyle = 'white'
         ctx.fillRect(0, 0, canvas.width, canvas.height)
         ctx.drawImage(img, 0, 0)
      }
      const a = document.createElement("a")
      a.download = `qr-${shortCode}.png`
      a.href = canvas.toDataURL("image/png")
      a.click()
    }
    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Generate QR Code</h2>
      </div>

      {/* Dynamic Tier & Progress Display */}
      <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        {tier === 'premium' ? (
          <p className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
            <span>✨</span> Premium Plan: Unlimited Generations
          </p>
        ) : (
          <div>
            <div className="flex justify-between text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">
              <span>Free Plan Usage</span>
              <span className={qrCount >= 10 ? 'text-red-500 dark:text-red-400 font-bold' : 'text-blue-600 dark:text-blue-400'}>
                {qrCount} / 10 used
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 mt-2">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${qrCount >= 10 ? 'bg-red-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min((qrCount / 10) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleGenerate}>
        <input
          type="url"
          placeholder="Enter URL (https://example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
        {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4 bg-red-50 dark:bg-red-500/10 p-3 rounded-xl border border-red-100 dark:border-red-500/20">{error}</p>}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors mb-6 shadow-md"
        >
          {loading ? 'Generating...' : 'Generate QR Code'}
        </button>
      </form>

      {qrData && (
        <div className="text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="bg-white p-4 rounded-xl shadow-sm inline-block mb-4 border border-gray-100 dark:border-slate-600">
            <QRCodeSVG id="qr-code-svg" value={qrData} size={200} level="H" includeMargin={true} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">
            Short code: <span className="font-mono text-gray-900 dark:text-gray-200 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-gray-200 dark:border-slate-600 shadow-sm">{shortCode}</span>
          </p>
          <button
            onClick={downloadQR}
            className="bg-green-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-md w-full"
          >
            Download QR Code PNG
          </button>
        </div>
      )}

      {/* Render the Upgrade Modal if they hit the limit */}
      {showUpgradePrompt && <UpgradePrompt onClose={() => setShowUpgradePrompt(false)} />}
    </div>
  )
}
