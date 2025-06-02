"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME, generateCsrfToken } from '@/lib/auth/csrf';

export default function MFASetupPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push('/auth/signin');
    return null;
  }

  const setupAppMFA = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get CSRF token from cookie
      let csrfToken = document.cookie.split('; ').find(row => row.startsWith(CSRF_COOKIE_NAME + '='))?.split('=')[1];
      if (!csrfToken) {
        csrfToken = generateCsrfToken();
        document.cookie = `${CSRF_COOKIE_NAME}=${csrfToken}; path=/; SameSite=Lax`;
      }
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: csrfToken || '',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup MFA');
      }
      
      setRecoveryCode(data.recoveryCode);
      setStep('verify');
      toast({
        title: "MFA setup initiated",
        description: "Scan the QR code with your authenticator app and enter the verification code.",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      toast({
        title: "MFA setup failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const setupSmsMFA = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!phoneNumber) {
        throw new Error('Phone number is required');
      }
      
      // Format phone number to E.164 format if not already
      let formattedPhoneNumber = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        formattedPhoneNumber = `+${phoneNumber}`;
      }
      
      // Get CSRF token from cookie
      let csrfToken = document.cookie.split('; ').find(row => row.startsWith(CSRF_COOKIE_NAME + '='))?.split('=')[1];
      if (!csrfToken) {
        csrfToken = generateCsrfToken();
        document.cookie = `${CSRF_COOKIE_NAME}=${csrfToken}; path=/; SameSite=Lax`;
      }
      const response = await fetch('/api/auth/mfa/setup-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: csrfToken || '',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          phoneNumber: formattedPhoneNumber,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup SMS MFA');
      }
      
      setStep('verify');
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code.",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      toast({
        title: "Failed to send verification code",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const verifyMFA = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!verificationCode) {
        throw new Error('Verification code is required');
      }
      
      // Get CSRF token from cookie
      let csrfToken = document.cookie.split('; ').find(row => row.startsWith(CSRF_COOKIE_NAME + '='))?.split('=')[1];
      if (!csrfToken) {
        csrfToken = generateCsrfToken();
        document.cookie = `${CSRF_COOKIE_NAME}=${csrfToken}; path=/; SameSite=Lax`;
      }
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: csrfToken || '',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          code: verificationCode,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify MFA');
      }
      
      setStep('complete');
      toast({
        title: "MFA setup complete",
        description: "Multi-factor authentication has been successfully enabled.",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      toast({
        title: "Failed to verify code",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-8">
      <div className="space-y-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center">Multi-Factor Authentication Setup</CardTitle>
            <CardDescription className="text-center">
              Enhance your account security by setting up MFA.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {step === 'setup' && (
              <>
                <Tabs defaultValue="app">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="app">Authenticator App</TabsTrigger>
                    <TabsTrigger value="sms">SMS</TabsTrigger>
                  </TabsList>
                  <TabsContent value="app" className="mt-4 space-y-4">
                    <div className="rounded-md bg-primary/10 p-4">
                      <h3 className="font-medium mb-2">How it works</h3>
                      <p className="text-sm text-muted-foreground">
                        We'll generate a QR code that you can scan with your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator).
                      </p>
                    </div>
                    <Button 
                      onClick={setupAppMFA} 
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? 'Setting up...' : 'Generate QR Code'}
                    </Button>
                  </TabsContent>
                  <TabsContent value="sms" className="mt-4 space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="bg-card"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter your phone number in international format (e.g., +1234567890).
                      </p>
                    </div>
                    <Button 
                      onClick={setupSmsMFA} 
                      className="w-full" 
                      disabled={loading || !phoneNumber}
                    >
                      {loading ? 'Sending...' : 'Send Verification Code'}
                    </Button>
                  </TabsContent>
                </Tabs>
              </>
            )}

            {step === 'verify' && (
              <>
                {recoveryCode && (
                  <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                    <h3 className="font-medium text-amber-800 mb-2">Recovery Code</h3>
                    <p className="text-sm text-amber-700 mb-2">
                      Save this recovery code in a safe place. You'll need it if you lose access to your authenticator app.
                    </p>
                    <div className="bg-white p-3 rounded border border-amber-300 font-mono text-center">
                      {recoveryCode}
                    </div>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    className="bg-card"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit verification code from your authenticator app or SMS.
                  </p>
                </div>
                <Button 
                  onClick={verifyMFA} 
                  className="w-full" 
                  disabled={loading || !verificationCode}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setStep('setup')} 
                  className="w-full"
                >
                  Back
                </Button>
              </>
            )}

            {step === 'complete' && (
              <>
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700">
                    Multi-factor authentication has been successfully enabled for your account.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={() => router.push('/dashboard')} 
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm">
          <Link href="/settings" className="inline-flex items-center text-primary hover:text-primary/80">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
