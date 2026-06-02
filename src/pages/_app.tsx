import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import Navbar from '@/components/Navbar';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="bg-indigo-600 px-4 py-3 text-white">
        <p className="text-center text-sm font-medium">
          Opening special: All users get premium for free if they sign up before July 31st, and they get it permanently!
        </p>
      </div>
      <Navbar />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
