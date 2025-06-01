import { Metadata } from 'next';
import { getServerUser } from '@/lib/firebase/get-server-user';
// Firebase auth doesn't need authOptions
import { redirect } from 'next/navigation';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';

export const metadata: Metadata = {
  title: 'Welcome to ClimaBill | Setup Your Account',
  description: 'Complete your ClimaBill account setup and start tracking your environmental impact.',
};

export default async function OnboardingPage() {
  // Get user from Firebase
  const user = await getServerUser();
  
  // Redirect if not authenticated
  if (!user) {
    redirect('/auth/signin');
  }

  // Get user ID
  const userId = user.uid || '';

  return (
    <div className="min-h-screen bg-background">
      <OnboardingFlow userId={userId} />
    </div>
  );
}
