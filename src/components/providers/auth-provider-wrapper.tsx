"use client";

import { SessionProvider } from 'next-auth/react';

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
