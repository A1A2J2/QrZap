import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { QrCode, ArrowRight } from 'lucide-react'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-slate-950 p-4 transition-colors duration-300 relative overflow-hidden isolate">
      {/* Decorative Background */}
      <div className="absolute top-0 inset-x-0 h-[800px] overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[120px] mix-blend-multiply" />
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 dark:bg-purple-600/20 blur-[120px] mix-blend-multiply" />
      </div>

      <div className="max-w-md w-full py-8">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6 hover:scale-105 transition-transform">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
              <QrCode className="w-8 h-8" />
            </div>
            <span className="font-black text-3xl tracking-tight text-gray-900 dark:text-white">QRForge</span>
          </Link>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Create an account</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Start managing your QR codes in seconds.</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 p-8 sm:p-10">
          {error && <p className="text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-4 rounded-2xl mb-6 text-sm font-medium flex items-center gap-2"><span>⚠️</span> {error}</p>}
          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full p-4 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-4 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-4 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold hover:scale-[1.02] transition-transform shadow-xl shadow-indigo-600/20 flex justify-center items-center gap-2 mt-2">
              Sign Up <ArrowRight size={18} />
            </button>
          </form>
          <p className="mt-8 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
            Already have an account? <Link href="/auth/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
