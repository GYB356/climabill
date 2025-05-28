"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClimaBillLogo } from '@/components/icons';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/lib/firebase/auth';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isResetComplete, setIsResetComplete] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isValidCode, setIsValidCode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { error, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('oobCode');
    if (code) {
      setOobCode(code);
      verifyResetCode(code);
    } else {
      setIsLoading(false);
      toast({
        title: "Invalid reset link",
        description: "The password reset link is invalid or has expired.",
        variant: "destructive"
      });
    }
  }, [searchParams, toast]);

  const verifyResetCode = async (code: string) => {
    try {
      const email = await authService.verifyPasswordResetCode(code);
      setEmail(email);
      setIsValidCode(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error verifying reset code:", error);
      setIsLoading(false);
      toast({
        title: "Invalid reset link",
        description: "The password reset link is invalid or has expired.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    setPasswordError('');
    
    if (oobCode) {
      try {
        setIsLoading(true);
        await authService.confirmPasswordReset(oobCode, password);
        setIsResetComplete(true);
        toast({
          title: "Password reset successful",
          description: "Your password has been reset. You can now log in with your new password.",
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Password reset error:", error);
        setIsLoading(false);
        toast({
          title: "Password reset failed",
          description: "There was an error resetting your password. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
        <div className="mx-auto grid w-[380px] gap-6 text-center">
          <ClimaBillLogo className="h-10 mx-auto text-primary" />
          <p>Verifying your reset link...</p>
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
          <CardTitle className="text-3xl font-bold text-foreground">Reset Password</CardTitle>
          <CardDescription className="text-muted-foreground">
            {isValidCode 
              ? `Create a new password for ${email}`
              : "This reset link is invalid or has expired."}
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
            
            {!isValidCode && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The password reset link is invalid or has expired. Please request a new password reset link.
                </AlertDescription>
              </Alert>
            )}
            
            {isResetComplete ? (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">
                  Your password has been reset successfully. You can now log in with your new password.
                </AlertDescription>
              </Alert>
            ) : isValidCode && (
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-card"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-card"
                  />
                  {passwordError && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading || isLoading}>
                  {loading || isLoading ? 'Resetting...' : 'Reset Password'}
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
