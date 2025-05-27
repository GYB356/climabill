
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClimaBillLogo } from '@/components/icons';

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
              Sign up with Google
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
