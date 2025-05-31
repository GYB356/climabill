"use client";

import React, { useState, useEffect } from 'react';
import { Download, X, WifiOff, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useServiceWorker } from '@/lib/pwa/useServiceWorker';

interface InstallPWAProps {
  className?: string;
}

export function InstallPWA({ className }: InstallPWAProps) {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const { isOffline } = useServiceWorker();
  
  // Listen for the beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
      
      // Check if we should show the install banner
      const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen');
      
      if (!hasSeenPrompt) {
        setShowInstallBanner(true);
      }
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  // Show offline banner when connection is lost
  useEffect(() => {
    if (isOffline) {
      setShowOfflineBanner(true);
    } else {
      // Hide after a short delay to ensure it's seen
      const timer = setTimeout(() => {
        setShowOfflineBanner(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOffline]);
  
  // Handle PWA installation
  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    // Clear the saved prompt since it can't be used again
    setInstallPrompt(null);
    
    // Hide the banner
    setShowInstallBanner(false);
    
    // Record that we've shown the prompt
    localStorage.setItem('pwa-install-prompt-seen', 'true');
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
  };
  
  // Dismiss the install banner
  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-prompt-seen', 'true');
  };
  
  // Dismiss the offline banner
  const dismissOfflineBanner = () => {
    setShowOfflineBanner(false);
  };
  
  if (!showInstallBanner && !showOfflineBanner) return null;
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}>
      {showInstallBanner && (
        <Card className="mb-2 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Smartphone className="h-6 w-6 text-primary mr-2" />
                <div>
                  <h3 className="font-medium">Install ClimaBill</h3>
                  <p className="text-sm text-muted-foreground">
                    Install our app for easier access and offline features
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={dismissInstallBanner} className="-mt-1 -mr-1">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={dismissInstallBanner}>
                Not now
              </Button>
              <Button size="sm" onClick={handleInstallClick}>
                <Download className="mr-2 h-4 w-4" />
                Install
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {showOfflineBanner && (
        <Card className="shadow-lg border-amber-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <WifiOff className="h-6 w-6 text-amber-500 mr-2" />
                <div>
                  <h3 className="font-medium">You're offline</h3>
                  <p className="text-sm text-muted-foreground">
                    {isOffline 
                      ? "Working in offline mode. Some features may be limited." 
                      : "Back online! Your changes will be synced."}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={dismissOfflineBanner} className="-mt-1 -mr-1">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
