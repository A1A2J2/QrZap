import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import Navbar from '@/components/Navbar';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Navbar />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
