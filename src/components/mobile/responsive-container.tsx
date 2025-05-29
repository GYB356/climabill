'use client';

import { useState, useEffect, ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  mobileContent: ReactNode;
  desktopBreakpoint?: number;
}

/**
 * A component that renders different content based on screen size
 * Shows mobileContent on small screens and children on larger screens
 */
export function ResponsiveContainer({ 
  children, 
  mobileContent, 
  desktopBreakpoint = 768 
}: ResponsiveContainerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set isClient to true once component mounts (to avoid hydration mismatch)
    setIsClient(true);
    
    // Check if the screen is mobile size
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < desktopBreakpoint);
    };

    // Initial check
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);

    // Clean up event listener
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, [desktopBreakpoint]);

  // During SSR or initial hydration, render nothing to avoid mismatch
  if (!isClient) {
    return null;
  }

  // Render mobile or desktop content based on screen size
  return isMobile ? <>{mobileContent}</> : <>{children}</>;
}
