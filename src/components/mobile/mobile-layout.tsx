'use client';

import { ReactNode } from 'react';
import { MobileHeader } from './mobile-header';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileLayoutProps {
  children: ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
  notificationCount?: number;
  fullHeight?: boolean;
}

export function MobileLayout({ 
  children, 
  user, 
  title, 
  showBackButton, 
  backUrl,
  notificationCount,
  fullHeight = false
}: MobileLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MobileHeader 
        user={user} 
        title={title} 
        showBackButton={showBackButton} 
        backUrl={backUrl}
        notificationCount={notificationCount}
      />
      
      {fullHeight ? (
        <div className="flex-1 relative">
          {children}
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <main className="container p-4 pb-16">
            {children}
          </main>
        </ScrollArea>
      )}
    </div>
  );
}
