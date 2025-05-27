
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Cookie } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'climabill_cookie_consent';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check localStorage only on the client-side after mount
    const consentGiven = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consentGiven) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setIsVisible(false);
  };

  if (!isMounted || !isVisible) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:max-w-md z-50 shadow-2xl border-primary/20 bg-background/95 backdrop-blur-sm">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Cookie className="h-8 w-8 text-primary flex-shrink-0 hidden sm:block" />
          <div className="flex-grow">
            <h4 className="font-semibold text-foreground mb-1 text-base">We Value Your Privacy</h4>
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your browsing experience and analyze our traffic. By clicking &quot;Accept&quot;, you consent to our use of cookies.
            </p>
          </div>
          <Button onClick={handleAccept} size="sm" className="w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0">
            <Check className="mr-2 h-4 w-4" />
            Accept
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
