import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import { CookieConsentBanner } from '@/components/cookie-consent-banner'; // Added
import { AuthProviderWrapper } from '@/components/providers/auth-provider-wrapper';

export const metadata: Metadata = {
  title: 'ClimaBill - Next-Gen Billing Management',
  description: 'Billing platform with AI insights and climate-conscious features.',
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
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
