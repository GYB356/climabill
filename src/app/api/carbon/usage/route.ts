import { NextRequest, NextResponse } from 'next/server';
import { CarbonTrackingService } from '@/lib/carbon/carbon-tracking-service';
import { getCurrentUser } from '@/lib/firebase/auth-admin';

/**
 * GET /api/carbon/usage
 * Get carbon usage history for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const organizationId = searchParams.get('organizationId') || undefined;
    
    // Get carbon tracking service
    const carbonTrackingService = new CarbonTrackingService();
    
    // Get carbon usage history
    const usageHistory = await carbonTrackingService.getCarbonUsageHistory(
      user.uid,
      limit,
      organizationId
    );
    
    // Get carbon footprint summary
    const summary = await carbonTrackingService.getCarbonFootprintSummary(
      user.uid,
      organizationId
    );
    
    return NextResponse.json({
      usageHistory,
      summary,
    });
  } catch (error) {
    console.error('Error getting carbon usage:', error);
    
    return NextResponse.json(
      { error: 'Failed to get carbon usage' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/carbon/usage
 * Track carbon usage for the current user
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Validate request body
    if (!body.usage || !body.period) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Get carbon tracking service
    const carbonTrackingService = new CarbonTrackingService();
    
    // Track carbon usage
    const carbonUsage = await carbonTrackingService.trackCarbonUsage(
      user.uid,
      body.usage,
      {
        startDate: new Date(body.period.startDate),
        endDate: new Date(body.period.endDate),
      },
      body.organizationId
    );
    
    return NextResponse.json({
      carbonUsage,
    });
  } catch (error) {
    console.error('Error tracking carbon usage:', error);
    
    return NextResponse.json(
      { error: 'Failed to track carbon usage' },
      { status: 500 }
    );
  }
}
