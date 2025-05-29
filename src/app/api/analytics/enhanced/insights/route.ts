import { NextRequest, NextResponse } from 'next/server';
import { EnhancedAnalyticsService } from '@/lib/analytics/enhanced/enhanced-analytics-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API route for getting insights
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
    const limitParam = searchParams.get('limit');

    // Validate required parameters
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Missing required parameter: organizationId is required' },
        { status: 400 }
      );
    }

    // Parse limit if provided
    let limit = 10;
    if (limitParam) {
      limit = parseInt(limitParam, 10);
      if (isNaN(limit) || limit <= 0) {
        return NextResponse.json(
          { error: 'Invalid limit parameter. Must be a positive integer.' },
          { status: 400 }
        );
      }
    }

    // Get insights
    const analyticsService = new EnhancedAnalyticsService();
    const result = await analyticsService.getInsights(organizationId, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting insights:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
