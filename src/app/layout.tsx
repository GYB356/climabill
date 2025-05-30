import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProviderWrapper } from '@/components/providers/auth-provider-wrapper';
import { ClientLayout } from '@/components/client-layout';

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
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
