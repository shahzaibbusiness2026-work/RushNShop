import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { StoreProvider } from '@/context/StoreContext';
import AppShell from '@/components/layout/AppShell';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F9FD' },
    { media: '(prefers-color-scheme: dark)', color: '#090D16' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'RushNshop - TikTok Shop Profit Margin Calculator & AI Analytics Suite',
  description: 'Professional TikTok Shop unit economics calculator, break-even analyzer, marketplace fee calculator, and AI-driven profit optimization suite for e-commerce sellers.',
  keywords: [
    'TikTok Shop Profit Calculator',
    'TikTok Shop Fees 2024',
    'TikTok Margin Calculator',
    'E-commerce Unit Economics',
    'TikTok Seller Analytics',
    'Break-Even Selling Price',
    'TikTok Ad Spend CPA Calculator',
    'RushNshop'
  ],
  authors: [{ name: 'RushNshop Engineering Team' }],
  creator: 'RushNshop',
  publisher: 'RushNshop',
  applicationName: 'RushNshop Platform',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rushnshop.com',
    siteName: 'RushNshop',
    title: 'RushNshop - TikTok Shop Profit Margin Calculator & AI Analytics Suite',
    description: 'Calculate product profitability, TikTok fees, break-even prices, and target margins before launching ads or products.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'RushNshop TikTok Shop Profit Intelligence Dashboard',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RushNshop - TikTok Shop Profit Margin Calculator',
    description: 'Calculate product profitability and TikTok marketplace fees in seconds.',
    images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80'],
    creator: '@rushnshop',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="antialiased bg-[#F8F9FD] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 min-h-screen selection:bg-brand-600 selection:text-white">
        <AuthProvider>
          <StoreProvider>
            <AppShell>
              {children}
            </AppShell>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
