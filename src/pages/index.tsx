'use client'

import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { QrCode, Zap, BarChart3, Shield, ArrowRight, Globe, Palette } from 'lucide-react';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300 selection:bg-indigo-500/30">
      <Head>
        <title>QRForge - The Ultimate QR Code Engine</title>
        <meta name="description" content="Generate, track, and manage dynamic QR codes for your business with real-time analytics." />
      </Head>

      {/* Global Interactive Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Mouse Follow Glow */}
        {mounted && (
          <div 
            className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-indigo-500/15 dark:bg-indigo-500/20 blur-[120px] transition-transform duration-1000 ease-out hidden md:block"
            style={{
              transform: `translate(${mousePosition.x - 300}px, ${mousePosition.y - 300}px)`
            }}
          />
        )}
        
        {/* Static Gradients for mobile/fallback */}
        <div className="absolute inset-0 overflow-hidden md:hidden">
          <div className="absolute top-10 left-10 w-[50%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-[40%] h-[40%] rounded-full bg-purple-400/20 dark:bg-purple-600/20 blur-[120px]" />
        </div>
        
        {/* Grid Pattern with dynamic light/dark contrast */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)] opacity-60 dark:opacity-100"></div>
      </div>

      <main className="flex-grow relative z-10">
        {/* Interactive Hero Section */}
        <section className="relative pt-32 pb-32 flex items-center min-h-[85vh] justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
            {/* Floating Badge */}
            <div className="animate-bounce-slow inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-indigo-700 dark:text-indigo-400 text-sm font-semibold mb-8 border border-slate-200 dark:border-slate-800 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/5 transition-all">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600 dark:bg-indigo-500"></span>
              </span>
              QRForge Enterprise Engine is Live
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.05]">
              Smarter QR <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 animate-gradient-x inline-block mt-2">
                Every Scan.
              </span>
            </h1>
            
            <p className="max-w-3xl mx-auto text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed font-medium">
              Stop guessing. Start tracking. The ultimate platform to generate dynamic QR codes, track global scans in real-time, and drive conversions.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Link
                href="/auth/signup"
                className="group relative w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/30 flex items-center justify-center gap-3 overflow-hidden active:scale-95"
              >
                <span className="relative z-10">Start Building Free</span>
                <ArrowRight size={22} className="relative z-10 group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="group w-full sm:w-auto px-10 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 flex items-center justify-center"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </section>

        {/* 3D Dashboard Preview Section */}
        <section className="relative pb-32 z-20 perspective-1000">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-[2.5rem] bg-white/40 dark:bg-slate-900/40 p-3 md:p-4 ring-1 ring-slate-200 dark:ring-slate-800 backdrop-blur-2xl transform-gpu rotate-x-12 hover:rotate-x-0 transition-transform duration-1000 ease-out shadow-2xl">
              <div className="rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden aspect-[16/9] flex flex-col relative z-20 group">
                {/* Browser Window Chrome */}
                <div className="h-14 border-b border-slate-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex items-center px-6 gap-3">
                  <div className="flex gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-400 dark:bg-red-500/80 shadow-inner"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-400 dark:bg-amber-500/80 shadow-inner"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-green-400 dark:bg-green-500/80 shadow-inner"></div>
                  </div>
                  <div className="mx-auto bg-white dark:bg-slate-950 text-xs font-mono text-slate-500 dark:text-slate-400 px-6 sm:px-32 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm transition-all group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                    <Shield size={12} /> app.qrforge.com/analytics
                  </div>
                </div>
                {/* Dashboard Content */}
                <div className="flex-1 bg-gray-50/50 dark:bg-slate-950 p-8 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex justify-center items-center opacity-5 dark:opacity-10 scale-150 transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-10 dark:group-hover:opacity-20 pointer-events-none">
                     <BarChart3 className="w-full h-full text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="z-10 text-center transform transition-transform duration-700 group-hover:scale-105">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 mb-6 shadow-xl shadow-indigo-500/10">
                      <Zap size={40} className="animate-pulse" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Live Global Tracking</h3>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto font-medium">Watch scans happen in real-time across the globe with millisecond precision.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Features Grid */}
        <section id="features" className="py-24 relative z-20 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-y border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wider uppercase text-sm mb-4 block">Power Tools</span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Everything you need,<br />built right in.</h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                Stop worrying about dead links and unmeasurable offline campaigns. QRForge gives you total control.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Zap className="w-8 h-8 text-amber-500" />,
                  title: 'Dynamic Routing',
                  desc: 'Change your destination URL instantly without ever reprinting the physical QR code.',
                  bg: 'bg-amber-100 dark:bg-amber-500/20',
                  hover: 'hover:border-amber-300 dark:hover:border-amber-500/50'
                },
                {
                  icon: <BarChart3 className="w-8 h-8 text-blue-500" />,
                  title: 'Deep Analytics',
                  desc: 'Track hourly scans, device types, and geographic locations automatically.',
                  bg: 'bg-blue-100 dark:bg-blue-500/20',
                  hover: 'hover:border-blue-300 dark:hover:border-blue-500/50'
                },
                {
                  icon: <Globe className="w-8 h-8 text-emerald-500" />,
                  title: 'Global Edge',
                  desc: 'Powered by edge computing ensuring sub-50ms redirect speeds worldwide.',
                  bg: 'bg-emerald-100 dark:bg-emerald-500/20',
                  hover: 'hover:border-emerald-300 dark:hover:border-emerald-500/50'
                },
                {
                  icon: <Palette className="w-8 h-8 text-purple-500" />,
                  title: 'Custom Branding',
                  desc: 'Download your QR codes as high-res PNGs and match your brand perfectly.',
                  bg: 'bg-purple-100 dark:bg-purple-500/20',
                  hover: 'hover:border-purple-300 dark:hover:border-purple-500/50'
                }
              ].map((feature, i) => (
                <div key={i} className={`group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden ${feature.hover}`}>
                  <div className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Massive CTA Section */}
        <section className="py-32 relative overflow-hidden isolate z-20">
          <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-900"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
          
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight text-white drop-shadow-sm">Scale your offline impact.</h2>
            <p className="text-xl md:text-2xl text-indigo-100 mb-12 font-medium max-w-2xl mx-auto">Join thousands of leading brands already routing millions of scans through QRForge.</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-600 hover:bg-slate-50 rounded-2xl font-black text-xl transition-all hover:scale-105 shadow-xl"
              >
                Create Free Account
                <ArrowRight size={24} />
              </Link>
              <span className="text-indigo-200 font-medium text-lg">No credit card required.</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 py-12 border-t border-slate-200 dark:border-slate-800 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="bg-indigo-600 p-2.5 rounded-xl text-white group-hover:scale-105 transition-transform shadow-md">
                <QrCode className="w-6 h-6" />
              </div>
              <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">QRForge</span>
            </div>
            <div className="flex gap-8 text-sm font-bold text-slate-500 dark:text-slate-400">
              <Link href="/pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</Link>
              <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Documentation</Link>
              <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="text-slate-500 dark:text-slate-500 text-sm font-medium">
               © {new Date().getFullYear()} QRForge Inc.
             </p>
             <p className="text-slate-500 dark:text-slate-500 text-sm font-medium">
               Engineered for global scale.
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
