'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Menu, 
  Home, 
  BarChart2, 
  FileText, 
  Settings, 
  Users, 
  ShoppingCart, 
  Activity,
  Zap,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';

interface MobileNavigationProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function MobileNavigation({ user }: MobileNavigationProps) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [userInitials, setUserInitials] = useState('');

  useEffect(() => {
    // Calculate user initials for avatar fallback
    if (user?.name) {
      const names = user.name.split(' ');
      const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
      setUserInitials(initials);
    } else if (user?.email) {
      setUserInitials(user.email.charAt(0).toUpperCase());
    }
  }, [user]);

  // Close the mobile menu when a link is clicked
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // Navigation items
  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/carbon/marketplace', label: 'Carbon Marketplace', icon: ShoppingCart },
    { href: '/analytics/benchmarking', label: 'Benchmarking', icon: Activity },
    { href: '/compliance-reporting', label: 'Compliance Reporting', icon: FileText },
    { href: '/analytics/enhanced', label: 'Enhanced Analytics', icon: Zap },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/team', label: 'Team', icon: Users },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <div className="border-b p-4 flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.name || 'User'}</span>
            <span className="text-xs text-muted-foreground">{user?.email || ''}</span>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-65px)]">
          <div className="p-2">
            <nav className="grid gap-1 px-2">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            
            <div className="mt-6 px-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={() => logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
