
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClimaBillLogo } from '@/components/icons';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  // In a real app, you'd use react-hook-form and handle submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Implement actual email sending logic
    alert('Password reset link would be sent to your email (functionality not implemented).');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
      <div className="mx-auto grid w-[380px] gap-6">
        <div className="grid gap-2 text-center">
          <Link href="/" className="mb-4 inline-block">
            <ClimaBillLogo className="h-10 mx-auto text-primary" />
          </Link>
          <CardTitle className="text-3xl font-bold text-foreground">Forgot Password</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </div>
        <Card className="shadow-xl">
          <CardContent className="grid gap-4 pt-6">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="bg-card"
                />
              </div>
              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>
            </form>
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
