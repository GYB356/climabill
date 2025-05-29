import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AnalyticsDashboard } from '@/components/analytics/enhanced/analytics-dashboard';

export const metadata: Metadata = {
  title: 'Enhanced Analytics | ClimaBill',
  description: 'Advanced analytics and insights for your environmental data',
};

export default async function EnhancedAnalyticsPage() {
  // Get session
  const session = await getServerSession(authOptions);
  
  // Redirect if not authenticated
  if (!session || !session.user) {
    redirect('/login');
  }

  // In a real implementation, we would fetch the user's organization ID
  // For now, we'll use a placeholder
  const organizationId = 'org_123456789';

  return (
    <div className="container mx-auto py-6">
      <AnalyticsDashboard organizationId={organizationId} />
    </div>
  );
}
