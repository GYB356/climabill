"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClimaBillLogo } from '@/components/icons';
import { ArrowLeft, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME, generateCsrfToken } from '@/lib/auth/csrf';

// Email validation schema
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    
    // Validate email
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    
    try {
      setLoading(true);
      
      // Get CSRF token from cookie
      let csrfToken = document.cookie.split('; ').find(row => row.startsWith(CSRF_COOKIE_NAME + '='))?.split('=')[1];
      if (!csrfToken) {
        csrfToken = generateCsrfToken();
        document.cookie = `${CSRF_COOKIE_NAME}=${csrfToken}; path=/; SameSite=Lax`;
      }
      
      // Call our new API endpoint
      const response = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: csrfToken || '',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited
          setIsRateLimited(true);
          setRetryAfter(data.retryAfter || 60);
          toast({
            title: "Too many attempts",
            description: "Please wait before trying again.",
            variant: "destructive"
          });
        } else {
          throw new Error(data.error || 'Failed to send reset email');
        }
        return;
      }
      
      setIsSubmitted(true);
      toast({
        title: "Reset link sent",
        description: "Check your email for a password reset link.",
      });
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
      <div className="mx-auto grid w-[380px] gap-6">
        <div className="grid gap-2 text-center">
          <Link href="/" className="mb-4 inline-block">
            <ClimaBillLogo className="h-10 mx-auto text-primary" />
          </Link>
          <CardTitle className="text-3xl font-bold text-foreground">Forgot Password</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </div>
        <Card className="shadow-xl">
          <CardContent className="grid gap-4 pt-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isRateLimited && (
              <Alert variant="warning" className="bg-amber-50 border-amber-200">
                <Clock className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-700">
                  Too many reset attempts. Please try again in {retryAfter} {retryAfter === 1 ? 'minute' : 'minutes'}.
                </AlertDescription>
              </Alert>
            )}
            
            {isSubmitted ? (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">
                  Password reset email sent. Check your inbox for further instructions.
                  <p className="mt-2 text-sm">If you don't see the email, please check your spam folder.</p>
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-card"
                    disabled={isRateLimited || loading}
                  />
                  <p className="text-xs text-muted-foreground">Enter the email address associated with your account</p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || isRateLimited}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="inline-flex items-center text-primary hover:text-primary/80">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
