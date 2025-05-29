import { NextRequest, NextResponse } from 'next/server';
import { EnhancedAnalyticsService } from '@/lib/analytics/enhanced/enhanced-analytics-service';
import { AnalyticsMetric, AnalyticsDimension, AnalyticsTimeFrame } from '@/lib/analytics/enhanced/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API route for getting time series data
 */
export async function GET(request: NextRequest) {
  try {
    // Get session and validate authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const metricParam = searchParams.get('metric');
    const dimensionParam = searchParams.get('dimension');
    const timeFrameParam = searchParams.get('timeFrame');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const filtersParam = searchParams.get('filters');

    // Validate required parameters
    if (!organizationId || !metricParam) {
      return NextResponse.json(
        { error: 'Missing required parameters: organizationId and metric are required' },
        { status: 400 }
      );
    }

    // Parse parameters
    const metric = metricParam as AnalyticsMetric;
    const dimension = dimensionParam as AnalyticsDimension | undefined;
    const timeFrame = (timeFrameParam as AnalyticsTimeFrame) || AnalyticsTimeFrame.MONTH;
    
    // Parse period if provided
    let period;
    if (startDateParam && endDateParam) {
      period = {
        startDate: new Date(startDateParam),
        endDate: new Date(endDateParam)
      };
    }

    // Parse filters if provided
    let filters;
    if (filtersParam) {
      try {
        filters = JSON.parse(filtersParam);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid filters format. Must be a valid JSON array.' },
          { status: 400 }
        );
      }
    }

    // Get time series data
    const analyticsService = new EnhancedAnalyticsService();
    const result = await analyticsService.getTimeSeriesData(
      organizationId,
      metric,
      dimension,
      timeFrame,
      period,
      filters
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting time series data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
