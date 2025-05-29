import { NextRequest, NextResponse } from 'next/server';
import { EnhancedAnalyticsService } from '@/lib/analytics/enhanced/enhanced-analytics-service';
import { ForecastConfig } from '@/lib/analytics/enhanced/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API route for generating forecasts
 */
export async function POST(request: NextRequest) {
  try {
    // Get session and validate authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { organizationId, config } = body;

    // Validate required fields
    if (!organizationId || !config) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId and config are required' },
        { status: 400 }
      );
    }

    // Validate config
    if (!config.method || !config.metric || !config.trainPeriod || !config.forecastPeriod || !config.granularity) {
      return NextResponse.json(
        { error: 'Invalid config: method, metric, trainPeriod, forecastPeriod, and granularity are required' },
        { status: 400 }
      );
    }

    // Generate forecast
    const analyticsService = new EnhancedAnalyticsService();
    const result = await analyticsService.generateForecast(organizationId, config as ForecastConfig);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating forecast:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
