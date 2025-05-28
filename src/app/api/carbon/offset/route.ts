import { NextRequest, NextResponse } from 'next/server';
import { CarbonOffsetService } from '@/lib/carbon/carbon-offset-service';
import { CarbonTrackingService } from '@/lib/carbon/carbon-tracking-service';
import { PaymentGateway, OffsetProjectType } from '@/lib/carbon/config';
import { getCurrentUser } from '@/lib/firebase/auth-admin';

/**
 * GET /api/carbon/offset
 * Get carbon offset history for the current user
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
    const donationId = searchParams.get('donationId') || undefined;
    
    // Get carbon tracking service
    const carbonTrackingService = new CarbonTrackingService();
    const carbonOffsetService = new CarbonOffsetService();
    
    // If donation ID is provided, get specific donation
    if (donationId) {
      const donation = await carbonOffsetService.getDonation(donationId);
      
      if (!donation || donation.userId !== user.uid) {
        return NextResponse.json(
          { error: 'Donation not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        donation,
      });
    }
    
    // Get carbon offset history
    const offsetHistory = await carbonTrackingService.getCarbonOffsetHistory(
      user.uid,
      limit,
      organizationId
    );
    
    // Get recommended offset
    const recommendedOffset = await carbonOffsetService.calculateRecommendedOffset(
      user.uid,
      organizationId
    );
    
    // Get available projects
    const projectType = searchParams.get('projectType') as OffsetProjectType | undefined;
    const availableProjects = await carbonTrackingService.getAvailableProjects(projectType);
    
    return NextResponse.json({
      offsetHistory,
      recommendedOffset,
      availableProjects,
    });
  } catch (error) {
    console.error('Error getting carbon offset data:', error);
    
    return NextResponse.json(
      { error: 'Failed to get carbon offset data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/carbon/offset
 * Create a carbon offset donation intent
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
    if (!body.carbonInKg || !body.paymentGateway) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Validate payment gateway
    if (!Object.values(PaymentGateway).includes(body.paymentGateway)) {
      return NextResponse.json(
        { error: 'Invalid payment gateway' },
        { status: 400 }
      );
    }
    
    // Get carbon offset service
    const carbonOffsetService = new CarbonOffsetService();
    
    // Create donation intent
    const donationIntent = await carbonOffsetService.createDonationIntent(
      user.uid,
      body.carbonInKg,
      body.paymentGateway,
      body.projectType,
      body.organizationId
    );
    
    return NextResponse.json({
      ...donationIntent,
    });
  } catch (error) {
    console.error('Error creating carbon offset donation:', error);
    
    return NextResponse.json(
      { error: 'Failed to create carbon offset donation' },
      { status: 500 }
    );
  }
}
