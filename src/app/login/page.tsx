"use client";

import { useState } from 'react';
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

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-.97 2.48-1.94 3.23v2.72h3.5c2.08-1.93 3.27-4.73 3.27-8.01z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.5-2.72c-.98.66-2.23 1.06-3.78 1.06-2.9 0-5.36-1.95-6.24-4.58H2.07v2.84C3.96 20.96 7.72 23 12 23z" fill="#34A853"/>
    <path d="M5.76 14.01C5.56 13.45 5.45 12.84 5.45 12.19s.11-1.26.31-1.82V9.5H2.07C1.38 10.69 1 11.9 1 13.25s.38 2.56 1.07 3.75l3.69-2.99z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.1-3.1C17.45 2.09 14.97 1 12 1 7.72 1 3.96 3.04 2.07 6.14l3.69 2.84c.88-2.63 3.34-4.58 6.24-4.58z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { login, loginWithGoogle, loginWithGithub, error, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Import and use the helper function to save callback URLs
      import('@/lib/firebase/improved-auth').then(({ saveCallbackUrl }) => {
        if (callbackUrl && callbackUrl !== '/dashboard') {
          saveCallbackUrl(callbackUrl);
        }
      });
      
      const user = await login(email, password);
      console.log('Login successful, user:', user);
      console.log('Redirecting to:', callbackUrl);
      
      // Show success toast
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });
      
      // Set redirecting state
      setIsRedirecting(true);
      
      // Small delay to show the success message, then redirect
      setTimeout(() => {
        router.replace(callbackUrl);
      }, 1000);
      
    } catch (error) {
      console.error("Login error:", error);
      setIsRedirecting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Import and use the helper function to save callback URLs
      import('@/lib/firebase/improved-auth').then(({ saveCallbackUrl }) => {
        if (callbackUrl && callbackUrl !== '/dashboard') {
          saveCallbackUrl(callbackUrl);
        }
      });
      
      const user = await loginWithGoogle();
      console.log('Google login successful, user:', user);
      console.log('Redirecting to:', callbackUrl);
      
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });
      
      // Set redirecting state
      setIsRedirecting(true);
      
      // Small delay to show the success message, then redirect
      setTimeout(() => {
        router.replace(callbackUrl);
      }, 1000);
      
    } catch (error) {
      console.error("Google login error:", error);
      setIsRedirecting(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      // Import and use the helper function to save callback URLs
      import('@/lib/firebase/improved-auth').then(({ saveCallbackUrl }) => {
        if (callbackUrl && callbackUrl !== '/dashboard') {
          saveCallbackUrl(callbackUrl);
        }
      });
      
      const user = await loginWithGithub();
      console.log('GitHub login successful, user:', user);
      console.log('Redirecting to:', callbackUrl);
      
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });
      
      // Set redirecting state
      setIsRedirecting(true);
      
      // Small delay to show the success message, then redirect
      setTimeout(() => {
        router.replace(callbackUrl);
      }, 1000);
      
    } catch (error) {
      console.error("GitHub login error:", error);
      setIsRedirecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
           <Link href="/" className="mb-4 inline-block">
            <ClimaBillLogo className="h-10 mx-auto text-primary" />
          </Link>
          <CardTitle className="text-3xl font-bold text-foreground">Login</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email below to login to your account
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
            <form onSubmit={handleEmailLogin}>
              <div className="grid gap-2">
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
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="ml-auto inline-block text-sm underline text-primary hover:text-primary/80">
                    Forgot your password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <Button 
                type="submit" 
                className="w-full mt-4" 
                disabled={loading || isRedirecting}
              >
                {isRedirecting ? 'Redirecting...' : (loading ? 'Logging in...' : 'Login')}
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
              onClick={handleGoogleLogin}
              disabled={loading || isRedirecting}
            >
              <GoogleIcon />
              Login with Google
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGithubLogin}
              disabled={loading || isRedirecting}
            >
              <Github className="mr-2 h-4 w-4" />
              Login with GitHub
            </Button>
          </CardContent>
        </Card>
        
        {/* Development Test Credentials Helper */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="text-sm text-blue-800">
                <h4 className="font-semibold mb-2">🧪 Development Test Credentials</h4>
                <div className="space-y-1 text-xs">
                  <div><strong>test@example.com</strong> / password123</div>
                  <div><strong>admin@climabill.com</strong> / admin123</div>
                  <div><strong>user@test.com</strong> / test123</div>
                  <div><strong>demo@demo.com</strong> / demo123</div>
                </div>
                <p className="mt-2 text-xs text-blue-600">
                  Or create a new account with any email/password combination.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline text-primary hover:text-primary/80">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}