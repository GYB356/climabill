import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { AnalyticsService, TimePeriod } from '@/lib/analytics/analytics-service';

/**
 * GET handler for retrieving time series data for analytics charts
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
    
    // Get parameters from query
    const searchParams = request.nextUrl.searchParams;
    const periodParam = searchParams.get('period') || 'month';
    const dataType = searchParams.get('type') || 'revenue';
    const dataPointsParam = searchParams.get('dataPoints') || '12';
    
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
    
    // Parse data points
    const dataPoints = parseInt(dataPointsParam, 10) || 12;
    
    // Get time series data based on type
    const analyticsService = new AnalyticsService();
    let data;
    
    switch (dataType.toLowerCase()) {
      case 'revenue':
        data = await analyticsService.getRevenueTimeSeries(period, dataPoints);
        break;
      case 'customers':
        data = await analyticsService.getCustomerGrowthTimeSeries(period, dataPoints);
        break;
      default:
        data = await analyticsService.getRevenueTimeSeries(period, dataPoints);
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error retrieving time series data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
