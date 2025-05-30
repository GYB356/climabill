import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import dynamic from 'next/dynamic';
import { AuthProviderWrapper } from '@/components/providers/auth-provider-wrapper';

// Lazy load non-critical components
const CookieConsentBanner = dynamic(
  () => import('@/components/cookie-consent-banner').then(mod => mod.CookieConsentBanner),
  { ssr: false, loading: () => <div className="hidden">Loading consent banner...</div> }
);

export const metadata: Metadata = {
  title: 'ClimaBill - Next-Gen Billing Management',
  description: 'Billing platform with AI insights and climate-conscious features.',
};

// Optimize font loading
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        {/* Preconnect to domains for resources */}
        <link rel="preconnect" href="https://placehold.co" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <AuthProviderWrapper>
          <LandingHeader />
          <main className="flex-grow">
            {children}
          </main>
          <LandingFooter />
          <Toaster />
          <CookieConsentBanner />
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
