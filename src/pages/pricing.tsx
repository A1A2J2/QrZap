import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { CheckCircle2, QrCode } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      <Head>
        <title>Pricing - QRForge</title>
      </Head>

      <Navbar />

      <main className="flex-grow relative isolate">
        {/* Decorative Background */}
        <div className="absolute top-0 inset-x-0 h-[600px] overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[120px] mix-blend-multiply" />
          <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 dark:bg-indigo-600/10 blur-[120px] mix-blend-multiply" />
        </div>

        <section className="pt-24 pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                Simple pricing,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">no surprises.</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Start for free, upgrade when you need more power and deeper insights.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
              {/* Free Plan */}
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800 flex flex-col hover:-translate-y-1 transition-transform relative overflow-hidden">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Hobby</h2>
                  <p className="text-gray-500 dark:text-gray-400">Perfect for side projects and testing.</p>
                </div>
                <div className="mb-8 flex items-baseline gap-2">
                  <span className="text-6xl font-black text-gray-900 dark:text-white">$0</span>
                  <span className="text-lg font-medium text-gray-500 dark:text-gray-400">/ forever</span>
                </div>
                <ul className="mb-10 space-y-5 text-gray-600 dark:text-gray-300 flex-grow">
                  {[
                    'Up to 10 Dynamic QR codes',
                    'Basic scan tracking (24h)',
                    'Standard redirect speeds',
                    'Community support'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className="w-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-white py-4 rounded-2xl font-bold text-center transition-colors">
                  Start for Free
                </Link>
              </div>

              {/* Premium Plan */}
              <div className="bg-gray-900 dark:bg-white p-10 rounded-[2rem] shadow-2xl shadow-indigo-500/20 flex flex-col relative transform md:scale-105 hover:-translate-y-1 transition-transform">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold px-6 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-500/30">
                  Most Popular
                </div>
                <div className="mb-8 mt-2 text-white dark:text-gray-900">
                  <h2 className="text-2xl font-bold mb-2">Pro</h2>
                  <p className="text-gray-400 dark:text-gray-500">For businesses that need robust tracking.</p>
                </div>
                <div className="mb-8 flex items-baseline gap-2 text-white dark:text-gray-900">
                  <span className="text-6xl font-black">$4.99</span>
                  <span className="text-lg font-medium opacity-80">/ month</span>
                </div>
                <ul className="mb-10 space-y-5 text-gray-300 dark:text-gray-600 flex-grow">
                  {[
                    'Unlimited QR codes',
                    'Deep analytics (Device & Country)',
                    'Historical data export (CSV/PDF)',
                    'Global edge routing (<50ms)',
                    'Priority 24/7 email support'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-indigo-400 dark:text-indigo-600 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => alert('PLACEHOLDER: Stripe checkout opens here')}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-4 rounded-2xl font-bold text-center transition-colors shadow-xl shadow-indigo-500/20"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-slate-950 py-12 border-t border-gray-100 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-6 text-center">
          <div className="flex items-center gap-2">
             <QrCode className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
             <span className="font-bold text-xl text-gray-900 dark:text-white">QRForge</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} QRForge. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
