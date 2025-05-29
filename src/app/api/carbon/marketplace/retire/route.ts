import { NextRequest, NextResponse } from 'next/server';
import { CarbonMarketplaceService } from '@/lib/carbon/marketplace/marketplace-service';
import { getCurrentUser } from '@/lib/firebase/auth-admin';

/**
 * POST /api/carbon/marketplace/retire
 * Retire carbon credits
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
    if (!body.creditIds || !Array.isArray(body.creditIds) || body.creditIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Get marketplace service
    const marketplaceService = new CarbonMarketplaceService();
    
    // Retire credits
    const retirementResult = await marketplaceService.retireCredits(
      user.uid,
      body.creditIds
    );
    
    return NextResponse.json({
      ...retirementResult
    });
  } catch (error) {
    console.error('Error retiring carbon credits:', error);
    
    return NextResponse.json(
      { error: 'Failed to retire carbon credits' },
      { status: 500 }
    );
  }
}
