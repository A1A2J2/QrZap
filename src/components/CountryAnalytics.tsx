import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AnalyticsData {
  country: string;
  device_type: string;
  scan_count: number;
}

interface CountryAnalyticsProps {
  qrCodeId: string;
}

export default function CountryAnalytics({ qrCodeId }: CountryAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!qrCodeId) {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // This component is inside an authenticated page, so this is a safeguard.
        setLoading(false);
        return;
      }

      // Call the new database function to get analytics for a specific QR code
      const { data, error } = await supabase.rpc('get_qr_code_analytics', {
        p_qr_code_id: qrCodeId,
        p_user_id: user.id, // Pass user ID for security
      });

      if (error) {
        console.error('Error fetching analytics:', error);
        setError('Failed to load analytics data.');
        setAnalytics([]);
      } else {
        setAnalytics(data || []);
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, [qrCodeId]);

  const exportToCSV = () => {
    if (analytics.length === 0) return;

    const headers = 'Scans,Country,Device\n';
    const csvContent = analytics
      .map(row => `${row.scan_count},"${row.country}","${row.device_type}"`)
      .join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `qr_analytics_${qrCodeId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    const element = document.getElementById(`qr-card-${qrCodeId}`);
    if (!element) return;
    
    // Hide buttons during capture
    const actionButtons = element.querySelectorAll('button');
    actionButtons.forEach(btn => btn.style.display = 'none');

    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`qr_analytics_${qrCodeId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      // Restore buttons
      actionButtons.forEach(btn => btn.style.display = '');
    }
  };

  if (loading) return <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800"><p className="text-gray-600 dark:text-gray-400">Loading scan details...</p></div>;
  if (error) return <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800"><p className="text-red-500 dark:text-red-400">{error}</p></div>;

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-slate-800 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Scans by Country & Device</h3>
        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            disabled={analytics.length === 0}
            className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600 disabled:bg-gray-400 disabled:dark:bg-gray-600 disabled:cursor-not-allowed"
          >
            Export PDF
          </button>
          <button
            onClick={exportToCSV}
            disabled={analytics.length === 0}
            className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 disabled:bg-gray-400 disabled:dark:bg-gray-600 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
              <th className="text-left py-2 px-4 font-semibold text-gray-600 dark:text-gray-300">Scans</th>
              <th className="text-left py-2 px-4 font-semibold text-gray-600 dark:text-gray-300">Country</th>
              <th className="text-left py-2 px-4 font-semibold text-gray-600 dark:text-gray-300">Device Type</th>
            </tr>
          </thead>
          <tbody>
            {analytics.length > 0 ? analytics.map((row, index) => (
              <tr key={index} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-800 dark:text-gray-300">
                <td className="py-2 px-4">{row.scan_count}</td>
                <td className="py-2 px-4">{row.country}</td>
                <td className="py-2 px-4 capitalize">{row.device_type}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500 dark:text-gray-400">No scan data available yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}