import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import QRCodesList from '@/components/QRCodesList';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { QrCode, Scan, Plus, BarChart3 } from 'lucide-react';

type QRCode = {
  id: string;
  original_url: string;
  short_code: string;
  click_count: number;
  created_at: string;
  qr_data: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [dateScans, setDateScans] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching QR codes:', error);
    } else if (data) {
      setQrCodes(data);
    }

    try {
      const analyticsRes = await fetch(`/api/qrcodes/analytics?user_id=${user.id}`);
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        let todayTotal = 0;
        analyticsData.forEach((qr: any) => {
          qr.raw_clicks?.forEach((click: string) => {
            const clickTime = new Date(click + (click.includes('Z') || click.includes('+') ? '' : 'Z'));
            if (clickTime >= startOfDay) todayTotal++;
          });
        });
        setDateScans(todayTotal);
      }
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    }
    
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center text-gray-900 dark:text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 p-8 transition-colors duration-300 relative isolate">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight drop-shadow-sm">Dashboard</h1>
          <div className="flex space-x-4 w-full md:w-auto">
            <Link href="/dashboard/analytics" className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-slate-800 px-6 py-3 rounded-2xl font-bold hover:scale-105 hover:shadow-lg transition-all flex-1 md:flex-none">
              <BarChart3 size={20} />
              <span className="hidden sm:inline">Analytics</span>
            </Link>
            <Link href="/dashboard/generate" className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20 transition-all flex-1 md:flex-none">
              <Plus size={20} />
              <span>Create QR</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between hover:-translate-y-1 transition-transform group">
            <div>
              <h2 className="text-xl font-bold text-gray-500 dark:text-gray-400 mb-1">Total QR Codes</h2>
              <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400">{qrCodes.length}</p>
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <QrCode size={40} />
            </div>
          </div>
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between hover:-translate-y-1 transition-transform group">
            <div>
              <h2 className="text-xl font-bold text-gray-500 dark:text-gray-400 mb-1">Today's Scans</h2>
              <p className="text-5xl font-black text-purple-600 dark:text-purple-400">{dateScans}</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Scan size={40} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Your QR Codes</h2>
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 p-2 overflow-hidden">
              <QRCodesList />
            </div>
          </div>
          <div className="lg:col-span-1 min-h-[400px]">
            <AnalyticsDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}