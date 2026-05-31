import { useRouter } from 'next/router'

export default function UpgradePrompt({ onClose }: { onClose: () => void }) {
  const router = useRouter()

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-slate-800">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-2xl">✨</span>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">Upgrade to Premium</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          You've reached the 10 QR code limit on the free plan. Upgrade to generate unlimited codes and access advanced analytics!
        </p>
        
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mb-6 text-center">
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            Only $4.99<span className="text-sm text-gray-500 dark:text-gray-400 font-normal">/month</span>
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => router.push('/pricing')}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md"
          >
            Upgrade Now
          </button>
          <button
            onClick={onClose}
            className="w-full bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}
