"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarProvider
} from '@/components/ui/sidebar';
import { 
  Home, 
  BarChart3, 
  CreditCard, 
  Settings, 
  TreePine, 
  Users, 
  Share2, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/firebase/auth-context';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };
  
  const handleLogout = async () => {
    await logout();
  };
  
  // Generate user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.displayName) return "U";
    
    const names = user.displayName.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 sm:max-w-xs">
            <MobileNavigation pathname={pathname} />
          </SheetContent>
        </Sheet>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">ClimaBill</h1>
        </div>
        <Avatar>
          <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
          <AvatarFallback>{getUserInitials()}</AvatarFallback>
        </Avatar>
      </header>
      
      {/* Desktop Layout */}
      <div className="flex-1 items-start md:grid md:grid-cols-[240px_1fr] md:gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="fixed top-0 z-30 hidden h-screen border-r md:sticky md:block">
          <SidebarProvider defaultOpen={true}>
            <Sidebar>
              <SidebarHeader className="h-14 flex items-center px-4">
                <div className="flex items-center gap-2">
                  <TreePine className="h-6 w-6 text-primary" />
                  <span className="text-lg font-semibold">ClimaBill</span>
                </div>
                <SidebarTrigger className="ml-auto h-8 w-8" />
              </SidebarHeader>
              
              <SidebarContent className="h-[calc(100vh-8rem)]">
                <ScrollArea className="h-full">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive('/dashboard')}
                        href="/dashboard"
                      >
                        <a>
                          <Home className="h-4 w-4" />
                          <span>Dashboard</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive('/dashboard/analytics')}
                        href="/dashboard/analytics"
                      >
                        <a>
                          <BarChart3 className="h-4 w-4" />
                          <span>Analytics</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive('/dashboard/offsets')}
                        href="/dashboard/offsets"
                      >
                        <a>
                          <TreePine className="h-4 w-4" />
                          <span>Carbon Offsets</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive('/dashboard/billing')}
                        href="/dashboard/billing"
                      >
                        <a>
                          <CreditCard className="h-4 w-4" />
                          <span>Billing</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive('/dashboard/share')}
                        href="/dashboard/share"
                      >
                        <a>
                          <Share2 className="h-4 w-4" />
                          <span>Share Impact</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive('/dashboard/team')}
                        href="/dashboard/team"
                      >
                        <a>
                          <Users className="h-4 w-4" />
                          <span>Team</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                  
                  <Separator className="my-4" />
                  
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive('/dashboard/settings')}
                        href="/dashboard/settings"
                      >
                        <a>
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive('/dashboard/help')}
                        href="/dashboard/help"
                      >
                        <a>
                          <HelpCircle className="h-4 w-4" />
                          <span>Help & Support</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </ScrollArea>
              </SidebarContent>
              
              <SidebarFooter className="border-t p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium leading-none truncate">{user?.displayName || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                  </div>
                </div>
              </SidebarFooter>
            </Sidebar>
          </SidebarProvider>
        </aside>
        
        <main className={cn("flex-1 p-4 md:p-8", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}

function MobileNavigation({ pathname }: { pathname: string }) {
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };
  
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <TreePine className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">ClimaBill</span>
        </div>
      </div>
      <nav className="grid gap-2 px-2">
        <Button
          asChild
          variant={isActive('/dashboard') && !pathname.includes('/') ? "default" : "ghost"}
          className="justify-start"
        >
          <a href="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </a>
        </Button>
        
        <Button
          asChild
          variant={isActive('/dashboard/analytics') ? "default" : "ghost"}
          className="justify-start"
        >
          <a href="/dashboard/analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </a>
        </Button>
        
        <Button
          asChild
          variant={isActive('/dashboard/offsets') ? "default" : "ghost"}
          className="justify-start"
        >
          <a href="/dashboard/offsets">
            <TreePine className="mr-2 h-4 w-4" />
            Carbon Offsets
          </a>
        </Button>
        
        <Button
          asChild
          variant={isActive('/dashboard/billing') ? "default" : "ghost"}
          className="justify-start"
        >
          <a href="/dashboard/billing">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </a>
        </Button>
        
        <Button
          asChild
          variant={isActive('/dashboard/share') ? "default" : "ghost"}
          className="justify-start"
        >
          <a href="/dashboard/share">
            <Share2 className="mr-2 h-4 w-4" />
            Share Impact
          </a>
        </Button>
        
        <Button
          asChild
          variant={isActive('/dashboard/team') ? "default" : "ghost"}
          className="justify-start"
        >
          <a href="/dashboard/team">
            <Users className="mr-2 h-4 w-4" />
            Team
          </a>
        </Button>
        
        <Separator className="my-4" />
        
        <Button
          asChild
          variant={isActive('/dashboard/settings') ? "default" : "ghost"}
          className="justify-start"
        >
          <a href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </a>
        </Button>
        
        <Button
          asChild
          variant={isActive('/dashboard/help') ? "default" : "ghost"}
          className="justify-start"
        >
          <a href="/dashboard/help">
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </a>
        </Button>
        
        <Button variant="ghost" className="justify-start" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </nav>
    </div>
  );
}
