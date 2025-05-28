"use client";

// Add type definitions for React
import * as React from 'react';
import { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
// Add proper type import for lucide-react
import type { LucideIcon } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
// Add proper type for toast
import { useToast, ToastActionElement } from '@/components/ui/use-toast';

interface LogoutButtonProps extends ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  showIcon?: boolean;
  className?: string;
}

export function LogoutButton({ 
  variant = 'outline', 
  showIcon = true, 
  className, 
  ...props 
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className}
      {...props}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
