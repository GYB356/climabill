
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClimaBillLogo } from '@/components/icons';
import { Github } from 'lucide-react'; 

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-.97 2.48-1.94 3.23v2.72h3.5c2.08-1.93 3.27-4.73 3.27-8.01z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.5-2.72c-.98.66-2.23 1.06-3.78 1.06-2.9 0-5.36-1.95-6.24-4.58H2.07v2.84C3.96 20.96 7.72 23 12 23z" fill="#34A853"/>
    <path d="M5.76 14.01C5.56 13.45 5.45 12.84 5.45 12.19s.11-1.26.31-1.82V9.5H2.07C1.38 10.69 1 11.9 1 13.25s.38 2.56 1.07 3.75l3.69-2.99z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.1-3.1C17.45 2.09 14.97 1 12 1 7.72 1 3.96 3.04 2.07 6.14l3.69 2.84c.88-2.63 3.34-4.58 6.24-4.58z" fill="#EA4335"/>
  </svg>
);

export default function SignupPage() {
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
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" placeholder="John Doe" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Create Account
            </Button>
            <Button variant="outline" className="w-full">
              <GoogleIcon />
              Sign up with Google
            </Button>
            <Button variant="outline" className="w-full">
              <Github className="mr-2 h-4 w-4" />
              Sign up with GitHub
            </Button>
          </CardContent>
        </Card>
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
