"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Home, 
  BarChart, 
  Leaf, 
  FileText, 
  Settings, 
  Building2, 
  LogOut, 
  User, 
  BrainCircuit, 
  Gauge, 
  Network, 
  Globe
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { useTranslation } from 'next-i18next';
import LanguageSelector from './LanguageSelector';

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { t } = useTranslation('common');
  
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const handleNavigation = (path: string) => {
    router.push(path);
    setOpen(false);
  };
  
  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader className="mb-6">
          <SheetTitle>{t('app.name')}</SheetTitle>
          <SheetDescription>{t('app.tagline')}</SheetDescription>
        </SheetHeader>
        
        {user && (
          <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{user.displayName || user.email}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-1 py-2">
          <Button 
            variant={isActive('/dashboard') ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => handleNavigation('/dashboard')}
          >
            <Home className="mr-2 h-5 w-5" />
            {t('navigation.dashboard')}
          </Button>
          
          <Button 
            variant={isActive('/carbon') ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => handleNavigation('/carbon/dashboard')}
          >
            <Leaf className="mr-2 h-5 w-5" />
            {t('carbon.dashboard')}
          </Button>
          
          <Button 
            variant={isActive('/carbon/offset') ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => handleNavigation('/carbon/offset')}
          >
            <Gauge className="mr-2 h-5 w-5" />
            Carbon Offsets
          </Button>
          
          <Button 
            variant={isActive('/carbon/management') ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => handleNavigation('/carbon/management')}
          >
            <Building2 className="mr-2 h-5 w-5" />
            {t('carbon.management', 'Carbon Management')}
          </Button>
        </div>
        
        <div className="space-y-1 py-2 border-t mt-4 pt-4">
          <h4 className="px-4 text-sm font-semibold">Analytics & Insights</h4>
          
          <Button 
            variant={isActive('/analytics') ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => handleNavigation('/analytics')}
          >
            <BarChart className="mr-2 h-5 w-5" />
            {t('carbon.analytics')}
          </Button>
          
          <Button 
            variant={isActive('/insights') ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => handleNavigation('/insights')}
          >
            <BrainCircuit className="mr-2 h-5 w-5" />
            {t('carbon.insights', 'AI Insights')}
          </Button>
          
          <Button 
            variant={isActive('/reports') ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => handleNavigation('/reports')}
          >
            <FileText className="mr-2 h-5 w-5" />
            {t('navigation.reports')}
          </Button>
        </div>
        
        <div className="space-y-1 py-2 border-t mt-4 pt-4">
          <h4 className="px-4 text-sm font-semibold">Account</h4>
          
          <Button 
            variant={isActive('/settings') ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => handleNavigation('/settings')}
          >
            <Settings className="mr-2 h-5 w-5" />
            {t('navigation.settings')}
          </Button>
          
          <Button 
            variant={isActive('/connections') ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => handleNavigation('/connections')}
          >
            <Network className="mr-2 h-5 w-5" />
            {t('navigation.apiDocs')}
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-5 w-5" />
            {t('navigation.logout')}
          </Button>
        </div>
        
        <div className="fixed bottom-4 left-4 right-4">
          <div className="text-xs text-muted-foreground text-center">
            <p>ClimaBill v2.0.0</p>
            <p>© 2025 ClimaBill Inc.</p>
          </div>
        </div>
        
        {/* Language Selection */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center mb-2">
            <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t('settings.language')}</span>
          </div>
          <LanguageSelector />
        </div>
      </SheetContent>
    </Sheet>
  );
}
