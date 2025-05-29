import { NextRequest, NextResponse } from 'next/server';
import { EnhancedAnalyticsService } from '@/lib/analytics/enhanced/enhanced-analytics-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API route for getting and managing dashboards
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
    const dashboardId = searchParams.get('dashboardId');

    // Initialize analytics service
    const analyticsService = new EnhancedAnalyticsService();

    // Get a specific dashboard if dashboardId is provided
    if (dashboardId) {
      const dashboard = await analyticsService.getDashboard(dashboardId);
      return NextResponse.json(dashboard);
    }

    // Otherwise, get all dashboards for the organization
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Missing required parameter: organizationId is required when dashboardId is not provided' },
        { status: 400 }
      );
    }

    const dashboards = await analyticsService.getDashboards(organizationId);
    return NextResponse.json(dashboards);
  } catch (error) {
    console.error('Error getting dashboards:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * API route for creating or updating a dashboard
 */
export async function POST(request: NextRequest) {
  try {
    // Get session and validate authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const dashboard = await request.json();

    // Validate required fields
    if (!dashboard || !dashboard.name || !dashboard.widgets) {
      return NextResponse.json(
        { error: 'Missing required fields: name and widgets are required' },
        { status: 400 }
      );
    }

    // Save dashboard
    const analyticsService = new EnhancedAnalyticsService();
    const result = await analyticsService.saveDashboard(dashboard);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving dashboard:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * API route for deleting a dashboard
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get session and validate authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const dashboardId = searchParams.get('dashboardId');

    // Validate required parameters
    if (!dashboardId) {
      return NextResponse.json(
        { error: 'Missing required parameter: dashboardId is required' },
        { status: 400 }
      );
    }

    // Delete dashboard
    const analyticsService = new EnhancedAnalyticsService();
    await analyticsService.deleteDashboard(dashboardId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dashboard:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
