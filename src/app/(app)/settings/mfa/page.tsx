"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export default function MFASetupPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [step, setStep] = useState<'phone' | 'code' | 'complete'>('phone');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const { user, enrollMFA, verifyMFA, error, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Initialize reCAPTCHA verifier
    if (!recaptchaVerifier && typeof window !== 'undefined') {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: () => {
          // reCAPTCHA solved, allow sending verification code
        },
        'expired-callback': () => {
          // Reset reCAPTCHA
          toast({
            title: "reCAPTCHA expired",
            description: "Please solve the reCAPTCHA again.",
            variant: "destructive"
          });
        }
      });
      setRecaptchaVerifier(verifier);
    }

    return () => {
      // Clean up reCAPTCHA verifier
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
    };
  }, [toast]);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleSendVerificationCode = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number.",
        variant: "destructive"
      });
      return;
    }

    if (!recaptchaVerifier) {
      toast({
        title: "reCAPTCHA not loaded",
        description: "Please wait for reCAPTCHA to load or refresh the page.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Format phone number to E.164 format if not already
      let formattedPhoneNumber = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        formattedPhoneNumber = `+${phoneNumber}`;
      }

      const verificationId = await enrollMFA(formattedPhoneNumber, recaptchaVerifier);
      setVerificationId(verificationId);
      setStep('code');
      toast({
        title: "Verification code sent",
        description: `A verification code has been sent to ${formattedPhoneNumber}.`,
      });
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast({
        title: "Failed to send verification code",
        description: "There was an error sending the verification code. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast({
        title: "Verification code required",
        description: "Please enter the verification code sent to your phone.",
        variant: "destructive"
      });
      return;
    }

    if (!verificationId) {
      toast({
        title: "Verification ID missing",
        description: "Please request a new verification code.",
        variant: "destructive"
      });
      return;
    }

    try {
      await verifyMFA(verificationId, verificationCode);
      setStep('complete');
      toast({
        title: "MFA enabled",
        description: "Multi-factor authentication has been successfully enabled for your account.",
      });
    } catch (error) {
      console.error("Error verifying code:", error);
      toast({
        title: "Failed to verify code",
        description: "The verification code is invalid or has expired. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
      <div className="mx-auto grid w-[380px] gap-6">
        <div className="grid gap-2 text-center">
          <CardTitle className="text-3xl font-bold text-foreground">Multi-Factor Authentication</CardTitle>
          <CardDescription className="text-muted-foreground">
            {step === 'phone' && "Set up an additional layer of security for your account."}
            {step === 'code' && "Enter the verification code sent to your phone."}
            {step === 'complete' && "Multi-factor authentication has been enabled."}
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

            {step === 'phone' && (
              <>
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
                <div id="recaptcha-container" className="my-4"></div>
                <Button 
                  onClick={handleSendVerificationCode} 
                  className="w-full" 
                  disabled={loading || !phoneNumber}
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </>
            )}

            {step === 'code' && (
              <>
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
                    Enter the 6-digit verification code sent to your phone.
                  </p>
                </div>
                <Button 
                  onClick={handleVerifyCode} 
                  className="w-full" 
                  disabled={loading || !verificationCode}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setStep('phone')} 
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
