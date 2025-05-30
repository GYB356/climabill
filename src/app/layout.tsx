import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProviderWrapper } from '@/components/providers/auth-provider-wrapper';
import { ClientLayout } from '@/components/client-layout';
import { InstallPWA } from '@/components/pwa/InstallPWA';
import Script from 'next/script';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export const metadata: Metadata = {
  title: 'ClimaBill - Carbon Tracking & Sustainability',
  description: 'Track, analyze, and offset your carbon footprint with advanced analytics and insights.',
  manifest: '/manifest.json',
  applicationName: 'ClimaBill',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ClimaBill',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#10b981',
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
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        {/* Preconnect to domains for resources */}
        <link rel="preconnect" href="https://placehold.co" />
        
        {/* PWA Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#10b981" />
        <meta name="msapplication-TileColor" content="#10b981" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <LanguageProvider>
          <AuthProviderWrapper>
            <ClientLayout>
              <InstallPWA />
              {children}
            </ClientLayout>
          </AuthProviderWrapper>
        </LanguageProvider>
        
        {/* Service Worker Registration */}
        <Script
          id="register-service-worker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('Service Worker registered with scope:', registration.scope);
                    })
                    .catch(function(error) {
                      console.error('Service Worker registration failed:', error);
                    });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
