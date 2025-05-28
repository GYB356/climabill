import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { AnalyticsService, TimePeriod } from '@/lib/analytics/analytics-service';

/**
 * GET handler for retrieving dashboard metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user has admin role to access analytics
    const isAdmin = session.user.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can access analytics' },
        { status: 403 }
      );
    }
    
    // Get time period from query parameters
    const searchParams = request.nextUrl.searchParams;
    const periodParam = searchParams.get('period') || 'month';
    
    // Validate and convert period parameter
    let period: TimePeriod;
    switch (periodParam.toLowerCase()) {
      case 'day':
        period = TimePeriod.DAY;
        break;
      case 'week':
        period = TimePeriod.WEEK;
        break;
      case 'month':
        period = TimePeriod.MONTH;
        break;
      case 'quarter':
        period = TimePeriod.QUARTER;
        break;
      case 'year':
        period = TimePeriod.YEAR;
        break;
      default:
        period = TimePeriod.MONTH;
    }
    
    // Get dashboard metrics
    const analyticsService = new AnalyticsService();
    const metrics = await analyticsService.getDashboardMetrics(period);
    
    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error retrieving dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
