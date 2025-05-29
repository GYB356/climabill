import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';

export const metadata: Metadata = {
  title: 'Welcome to ClimaBill | Setup Your Account',
  description: 'Complete your ClimaBill account setup and start tracking your environmental impact.',
};

export default async function OnboardingPage() {
  // Get session
  const session = await getServerSession(authOptions);
  
  // Redirect if not authenticated
  if (!session || !session.user) {
    redirect('/login');
  }

  // Get user ID
  const userId = session.user.id || '';

  return (
    <div className="min-h-screen bg-background">
      <OnboardingFlow userId={userId} />
    </div>
  );
}
