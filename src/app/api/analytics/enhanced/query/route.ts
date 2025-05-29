import { NextRequest, NextResponse } from 'next/server';
import { EnhancedAnalyticsService } from '@/lib/analytics/enhanced/enhanced-analytics-service';
import { AnalyticsQuery } from '@/lib/analytics/enhanced/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API route for executing analytics queries
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
    const query: AnalyticsQuery = body.query;

    // Validate required fields
    if (!query || !query.organizationId || !query.metrics || !query.timeFrame) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, metrics, and timeFrame are required' },
        { status: 400 }
      );
    }

    // Execute the query
    const analyticsService = new EnhancedAnalyticsService();
    const result = await analyticsService.executeQuery(query);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error executing analytics query:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
