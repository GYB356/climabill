import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MobileLayout } from '@/components/mobile/mobile-layout';
import { MobileDashboard } from '@/components/mobile/mobile-dashboard';

export const metadata: Metadata = {
  title: 'Mobile Dashboard | ClimaBill',
  description: 'Mobile-optimized dashboard for ClimaBill',
};

export default async function MobileDashboardPage() {
  // Get session
  const session = await getServerSession(authOptions);
  
  // Redirect if not authenticated
  if (!session || !session.user) {
    redirect('/login');
  }

  // In a real implementation, we would fetch the user's organization ID
  // For now, we'll use a placeholder
  const organizationId = 'org_123456789';
  const userName = session.user.name?.split(' ')[0] || 'User';

  return (
    <MobileLayout user={session.user} notificationCount={3}>
      <MobileDashboard 
        organizationId={organizationId} 
        userName={userName} 
      />
    </MobileLayout>
  );
}
