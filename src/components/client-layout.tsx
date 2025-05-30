"use client";

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Toaster } from "@/components/ui/toaster";
import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';

// Lazy load non-critical components in client component
const CookieConsentBanner = dynamic(
  () => import('@/components/cookie-consent-banner').then(mod => mod.CookieConsentBanner),
  { ssr: false, loading: () => <div className="hidden">Loading consent banner...</div> }
);

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <LandingHeader />
      <main className="flex-grow">
        {children}
      </main>
      <LandingFooter />
      <Toaster />
      <CookieConsentBanner />
    </>
  );
}
