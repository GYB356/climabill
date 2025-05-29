import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * API route for saving dashboard personalization settings
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
    const { userId, dashboardId, settings } = body;

    // Validate required fields
    if (!userId || !settings) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and settings are required' },
        { status: 400 }
      );
    }

    // Validate user has permission to save dashboard
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to save this dashboard' },
        { status: 403 }
      );
    }

    // If this dashboard is set as default, unset any other default dashboards
    if (settings.isDefault) {
      await db.userDashboard.updateMany({
        where: {
          userId,
          isDefault: true,
          id: { not: dashboardId }
        },
        data: {
          isDefault: false
        }
      });
    }

    // Save or update dashboard settings
    let dashboard;
    if (dashboardId) {
      // Update existing dashboard
      dashboard = await db.userDashboard.update({
        where: { id: dashboardId },
        data: {
          name: settings.name,
          isDefault: settings.isDefault,
          refreshInterval: parseInt(settings.refreshInterval),
          autoRefresh: settings.autoRefresh,
          dateRange: settings.dateRange,
          layout: settings.layout,
          widgets: settings.widgets,
          theme: settings.theme,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new dashboard
      dashboard = await db.userDashboard.create({
        data: {
          userId,
          name: settings.name,
          isDefault: settings.isDefault,
          refreshInterval: parseInt(settings.refreshInterval),
          autoRefresh: settings.autoRefresh,
          dateRange: settings.dateRange,
          layout: settings.layout,
          widgets: settings.widgets,
          theme: settings.theme,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Error saving dashboard personalization:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * API route for getting dashboard personalization settings
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
    const userId = searchParams.get('userId');
    const dashboardId = searchParams.get('dashboardId');

    // Validate required parameters
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId is required' },
        { status: 400 }
      );
    }

    // Validate user has permission to access dashboard
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to access this dashboard' },
        { status: 403 }
      );
    }

    let dashboard;
    if (dashboardId) {
      // Get specific dashboard
      dashboard = await db.userDashboard.findUnique({
        where: { id: dashboardId }
      });

      if (!dashboard) {
        return NextResponse.json(
          { error: 'Dashboard not found' },
          { status: 404 }
        );
      }
    } else {
      // Get all dashboards for user
      dashboard = await db.userDashboard.findMany({
        where: { userId }
      });
    }

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Error getting dashboard personalization:', error);
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

    // Get dashboard to check ownership
    const dashboard = await db.userDashboard.findUnique({
      where: { id: dashboardId }
    });

    if (!dashboard) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      );
    }

    // Validate user has permission to delete dashboard
    if (dashboard.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this dashboard' },
        { status: 403 }
      );
    }

    // Delete dashboard
    await db.userDashboard.delete({
      where: { id: dashboardId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dashboard:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
