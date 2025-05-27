import type { ReactNode } from 'react';
import { AppNavigation } from '@/components/navigation';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AppNavigation />
      <main className="flex-1 md:ml-64 bg-background">
        <div className="p-4 sm:p-6 lg:p-8">
         {children}
        </div>
      </main>
    </div>
  );
}
