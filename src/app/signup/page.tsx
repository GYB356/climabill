"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClimaBillLogo } from '@/components/icons';
import { Github } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-.97 2.48-1.94 3.23v2.72h3.5c2.08-1.93 3.27-4.73 3.27-8.01z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.5-2.72c-.98.66-2.23 1.06-3.78 1.06-2.9 0-5.36-1.95-6.24-4.58H2.07v2.84C3.96 20.96 7.72 23 12 23z" fill="#34A853"/>
    <path d="M5.76 14.01C5.56 13.45 5.45 12.84 5.45 12.19s.11-1.26.31-1.82V9.5H2.07C1.38 10.69 1 11.9 1 13.25s.38 2.56 1.07 3.75l3.69-2.99z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.1-3.1C17.45 2.09 14.97 1 12 1 7.72 1 3.96 3.04 2.07 6.14l3.69 2.84c.88-2.63 3.34-4.58 6.24-4.58z" fill="#EA4335"/>
  </svg>
);

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signup, loginWithGoogle, loginWithGithub, error, loading, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Password validation schema
  const passwordSchema = z.object({
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate password using schema
    const validationResult = passwordSchema.safeParse({ password, confirmPassword });
    if (!validationResult.success) {
      setPasswordError(validationResult.error.errors[0].message);
      return;
    }
    setPasswordError('');
    try {
      // Import and use the helper function to save callback URLs
      import('@/lib/firebase/improved-auth').then(({ saveCallbackUrl }) => {
        if (callbackUrl && callbackUrl !== '/dashboard') {
          saveCallbackUrl(callbackUrl);
        }
      });
      await signup(email, password);
      toast({
        title: "Account created successfully",
        description: "You have been registered and logged in.",
      });
      // Auth context will handle redirection
    } catch (error) {
      console.error("Signup error:", error);
      // Error state is handled by the auth context
    }
  };

  const handleGoogleSignup = async () => {
    try {
      // Import and use the helper function to save callback URLs
      import('@/lib/firebase/improved-auth').then(({ saveCallbackUrl }) => {
        if (callbackUrl && callbackUrl !== '/dashboard') {
          saveCallbackUrl(callbackUrl);
        }
      });
      
      await loginWithGoogle();
      toast({
        title: "Account created successfully",
        description: "You have been registered with Google.",
      });
      // Auth context will handle redirection
    } catch (error) {
      console.error("Google signup error:", error);
      // Error state is handled by the auth context
    }
  };

  const handleGithubSignup = async () => {
    try {
      // Import and use the helper function to save callback URLs
      import('@/lib/firebase/improved-auth').then(({ saveCallbackUrl }) => {
        if (callbackUrl && callbackUrl !== '/dashboard') {
          saveCallbackUrl(callbackUrl);
        }
      });
      
      await loginWithGithub();
      toast({
        title: "Account created successfully",
        description: "You have been registered with GitHub.",
      });
      // Auth context will handle redirection
    } catch (error) {
      console.error("GitHub signup error:", error);
      // Error state is handled by the auth context
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
      <div className="mx-auto grid w-[380px] gap-6">
        <div className="grid gap-2 text-center">
          <Link href="/" className="mb-4 inline-block">
            <ClimaBillLogo className="h-10 mx-auto text-primary" />
          </Link>
          <CardTitle className="text-3xl font-bold text-foreground">Create an Account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your information to get started with ClimaBill.
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
            <form onSubmit={handleSignup}>
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input 
                  id="full-name" 
                  placeholder="John Doe" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required 
                />
              </div>
              <div className="grid gap-2 mt-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="grid gap-2 mt-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="grid gap-2 mt-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full mt-4" 
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              <GoogleIcon />
              Sign up with Google
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGithubSignup}
              disabled={loading}
            >
              <Github className="mr-2 h-4 w-4" />
              Sign up with GitHub
            </Button>
          </CardContent>
        </Card>
        
        {/* Development Test Credentials Helper */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4">
              <div className="text-sm text-green-800">
                <h4 className="font-semibold mb-2">🧪 Development Mode</h4>
                <p className="text-xs text-green-600 mb-2">
                  Create an account with any email/password (min. 6 characters).
                </p>
                <div className="text-xs">
                  <strong>Existing test accounts:</strong>
                  <div className="mt-1 space-y-1">
                    <div>test@example.com / password123</div>
                    <div>admin@climabill.com / admin123</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline text-primary hover:text-primary/80">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
