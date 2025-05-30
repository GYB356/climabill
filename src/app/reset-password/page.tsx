"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClimaBillLogo } from '@/components/icons';
import { ArrowLeft, AlertCircle, CheckCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/lib/firebase/auth';
import { z } from 'zod';

// Password validation schema
const passwordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isResetComplete, setIsResetComplete] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isValidCode, setIsValidCode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
      setError("The password reset link is invalid or has expired.");
      toast({
        title: "Invalid reset link",
        description: "The password reset link is invalid or has expired.",
        variant: "destructive"
      });
    }
  }, [searchParams, toast]);

  const verifyResetCode = async (code: string) => {
    try {
      // Call our new API endpoint for token verification
      const response = await fetch('/api/auth/password/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oobCode: code }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid reset token');
      }
      
      setEmail(data.email);
      setIsValidCode(true);
    } catch (err) {
      console.error("Error verifying reset code:", err);
      setError(err instanceof Error ? err.message : "The password reset link is invalid or has expired.");
      toast({
        title: "Invalid reset link",
        description: "The password reset link is invalid or has expired.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError('');
    setError(null);
    
    // Validate password using schema
    const validationResult = passwordSchema.safeParse({ password, confirmPassword });
    if (!validationResult.success) {
      setPasswordError(validationResult.error.errors[0].message);
      return;
    }
    
    if (oobCode) {
      try {
        setLoading(true);
        
        // Call our new API endpoint for confirming password resets
        const response = await fetch('/api/auth/password/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ oobCode, password }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited
            toast({
              title: "Too many attempts",
              description: "Please wait before trying again.",
              variant: "destructive"
            });
          }
          throw new Error(data.message || 'Failed to reset password');
        }
        
        setIsResetComplete(true);
        toast({
          title: "Password reset successful",
          description: "Your password has been reset. You can now log in with your new password.",
        });
        
        // Automatically redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (err) {
        console.error("Password reset error:", err);
        setError(err instanceof Error ? err.message : "There was an error resetting your password. Please try again.");
        toast({
          title: "Password reset failed",
          description: "There was an error resetting your password. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
                  <p>Your password has been reset successfully. You can now log in with your new password.</p>
                  <p className="mt-2 text-sm">Redirecting to login page...</p>
                </AlertDescription>
              </Alert>
            ) : isValidCode && (
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password" className="flex justify-between">
                    <span>New Password</span>
                    <span className="text-xs text-muted-foreground">Must be at least 8 characters</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-card pr-10"
                      disabled={loading}
                    />
                    <button 
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <ul className="text-xs space-y-1 text-muted-foreground mt-1">
                    <li className={password.length >= 8 ? "text-green-600" : ""}>• At least 8 characters</li>
                    <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>• At least one uppercase letter</li>
                    <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>• At least one lowercase letter</li>
                    <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>• At least one number</li>
                    <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}>• At least one special character</li>
                  </ul>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-card"
                    disabled={loading}
                  />
                  {passwordError && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}
                </div>
                <Alert variant="default" className="bg-blue-50 border-blue-200">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-700 text-sm">
                    Choose a strong password that you don't use for other websites.
                  </AlertDescription>
                </Alert>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || password.length < 8}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
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
