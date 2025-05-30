"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClimaBillLogo } from '@/components/icons';
import { ArrowLeft, AlertCircle, CheckCircle, Mail, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/lib/firebase/auth';
import { z } from 'zod';

// Email validation schema
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [isResendSuccess, setIsResendSuccess] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [showResendForm, setShowResendForm] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const oobCode = searchParams.get('oobCode');
    if (oobCode) {
      verifyEmail(oobCode);
    } else {
      setError('No verification code provided. Please check your email for a verification link.');
      setShowResendForm(true);
    }
  }, [searchParams]);

  const verifyEmail = async (code: string) => {
    setIsVerifying(true);
    try {
      await authService.applyActionCode(code);
      setIsVerified(true);
      toast({
        title: "Email verified",
        description: "Your email has been successfully verified.",
      });
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error) {
      console.error("Email verification error:", error);
      setError('Invalid or expired verification link. Please request a new verification email.');
      setShowResendForm(true);
      toast({
        title: "Verification failed",
        description: "Invalid or expired verification link.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsResending(true);
    setIsResendSuccess(false);

    try {
      // Call our new API endpoint
      const response = await fetch('/api/auth/email/verify/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          throw new Error(data.message || 'Failed to send verification email');
        }
        return;
      }

      setIsResendSuccess(true);
      toast({
        title: "Verification email sent",
        description: "Check your inbox for the verification link.",
      });
    } catch (err) {
      console.error("Error resending verification email:", err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      toast({
        title: "Failed to send verification email",
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
        <div className="mx-auto grid w-[380px] gap-6 text-center">
          <ClimaBillLogo className="h-10 mx-auto text-primary" />
          <p>Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
      <div className="mx-auto grid w-[380px] gap-6">
        <div className="grid gap-2 text-center">
          <Link href="/" className="mb-4 inline-block">
            <ClimaBillLogo className="h-10 mx-auto text-primary" />
          </Link>
          <CardTitle className="text-3xl font-bold text-foreground">Email Verification</CardTitle>
          <CardDescription className="text-muted-foreground">
            {isVerified 
              ? "Your email has been successfully verified."
              : "There was a problem verifying your email."}
          </CardDescription>
        </div>
        <Card className="shadow-xl">
          <CardContent className="grid gap-4 pt-6">
            {isVerified ? (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">
                  Your email has been successfully verified. Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            ) : (
              <>
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
                      Too many verification attempts. Please try again in {retryAfter} {retryAfter === 1 ? 'minute' : 'minutes'}.
                    </AlertDescription>
                  </Alert>
                )}
                
                {isResendSuccess && (
                  <Alert variant="default" className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-700">
                      Verification email sent! Please check your inbox and click the verification link.
                      <p className="mt-2 text-sm">If you don't see the email, please check your spam folder.</p>
                    </AlertDescription>
                  </Alert>
                )}
                
                {isVerifying ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-3">Verifying your email...</span>
                  </div>
                ) : showResendForm && !isResendSuccess ? (
                  <form onSubmit={handleResendVerification} className="grid gap-4">
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
                        disabled={isResending || isRateLimited}
                      />
                      <p className="text-xs text-muted-foreground">Enter the email address you used to sign up</p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isResending || isRateLimited}
                    >
                      {isResending ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Resend Verification Email
                        </>
                      )}
                    </Button>
                  </form>
                ) : !isResendSuccess && (
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      If you haven't received a verification email, please check your spam folder or contact support.
                    </p>
                  </div>
                )}
              </>
            )}
            <div className="grid gap-2 mt-4">
              <Button 
                onClick={() => router.push('/dashboard')} 
                className="w-full"
                variant={isVerified ? "default" : "outline"}
              >
                {isVerified ? 'Go to Dashboard' : 'Go to Home'}
              </Button>
              
              {!isVerified && (
                <Button 
                  onClick={() => router.push('/login')} 
                  className="w-full"
                >
                  Login to Request New Verification
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
