"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClimaBillLogo } from '@/components/icons';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/lib/firebase/auth';

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const oobCode = searchParams.get('oobCode');
    if (oobCode) {
      verifyEmail(oobCode);
    } else {
      setIsVerifying(false);
      toast({
        title: "Invalid verification link",
        description: "The email verification link is invalid or has expired.",
        variant: "destructive"
      });
    }
  }, [searchParams, toast]);

  const verifyEmail = async (oobCode: string) => {
    try {
      await authService.verifyEmail(oobCode);
      setIsVerified(true);
      toast({
        title: "Email verified",
        description: "Your email has been successfully verified.",
      });
    } catch (error) {
      console.error("Error verifying email:", error);
      toast({
        title: "Verification failed",
        description: "The email verification link is invalid or has expired.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
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
                  Your email has been successfully verified. You can now use all features of your account.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The email verification link is invalid or has expired. Please request a new verification link.
                </AlertDescription>
              </Alert>
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
