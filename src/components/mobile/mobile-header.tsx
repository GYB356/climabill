'use client';

import Link from 'next/link';
import { MobileNavigation } from './mobile-navigation';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Search,
  ChevronLeft
} from 'lucide-react';
import { usePathname } from 'next/navigation';

interface MobileHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
  notificationCount?: number;
}

export function MobileHeader({ 
  user, 
  title, 
  showBackButton = false, 
  backUrl = '/dashboard',
  notificationCount = 0
}: MobileHeaderProps) {
  const pathname = usePathname();

  // Determine title based on pathname if not provided
  const getTitle = () => {
    if (title) return title;

    // Extract title from pathname
    const path = pathname?.split('/').filter(Boolean);
    if (!path || path.length === 0) return 'Dashboard';

    // Get the last segment of the path and format it
    let pageName = path[path.length - 1];
    
    // Replace hyphens with spaces and capitalize each word
    pageName = pageName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Special case for specific paths
    if (pageName === 'Enhanced') return 'Enhanced Analytics';
    if (pageName === 'Marketplace') return 'Carbon Marketplace';
    if (pageName === 'Benchmarking') return 'Industry Benchmarking';
    
    return pageName;
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0">
      <div className="flex flex-1 items-center">
        {showBackButton ? (
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href={backUrl}>
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
        ) : (
          <MobileNavigation user={user} />
        )}
        
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-lg font-semibold">{getTitle()}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
