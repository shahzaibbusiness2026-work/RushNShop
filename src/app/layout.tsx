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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://rushnshop.com'),
  title: {
    default: 'RushNshop — TikTok Shop Profit Calculator & Unit Economics SaaS',
    template: '%s | RushNshop'
  },
  description: 'The all-in-one TikTok Shop profit margin calculator, break-even analyzer, marketplace fee engine, and unit economics intelligence SaaS for e-commerce sellers and agencies.',
  keywords: [
    'TikTok Shop Profit Calculator',
    'TikTok Shop Unit Economics',
    'TikTok Shop Fees 2026',
    'TikTok Margin Calculator',
    'TikTok Ads CPA Breakeven',
    'TikTok Dropshipping Profit Calculator',
    'TikTok Seller Center Profit Tracker',
    'RushNshop SaaS'
  ],
  authors: [{ name: 'RushNshop Team', url: 'https://rushnshop.com' }],
  creator: 'RushNshop',
  publisher: 'RushNshop Inc.',
  applicationName: 'RushNshop Platform',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://rushnshop.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rushnshop.com',
    siteName: 'RushNshop',
    title: 'RushNshop — TikTok Shop Profit Calculator & Unit Economics SaaS',
    description: 'Calculate product profitability, TikTok fees, break-even prices, and target margins before launching ads or sourcing products.',
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
    title: 'RushNshop — TikTok Shop Profit Margin Calculator',
    description: 'Calculate product profitability, shipping balance, and TikTok marketplace fees in seconds.',
    images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80'],
    creator: '@rushnshop',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'RushNshop',
  operatingSystem: 'All',
  applicationCategory: 'BusinessApplication',
  description: 'TikTok Shop profit margin calculator and unit economics intelligence software.',
  url: 'https://rushnshop.com',
  offers: [
    {
      '@type': 'Offer',
      price: '29.00',
      priceCurrency: 'USD',
      name: 'Starter Merchant Plan',
      billingDuration: 'P1M',
    },
    {
      '@type': 'Offer',
      price: '79.00',
      priceCurrency: 'USD',
      name: 'Pro Brand & Seller Plan',
      billingDuration: 'P1M',
    }
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '348',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
