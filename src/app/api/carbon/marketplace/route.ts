import { NextRequest, NextResponse } from 'next/server';
import { CarbonMarketplaceService } from '@/lib/carbon/marketplace/marketplace-service';
import { CreditType, VerificationStandard } from '@/lib/carbon/marketplace/types';
import { getCurrentUser } from '@/lib/firebase/auth-admin';

/**
 * GET /api/carbon/marketplace
 * Get available carbon credits
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
    const creditType = searchParams.get('creditType') as CreditType | undefined;
    const verificationStandard = searchParams.get('verificationStandard') as VerificationStandard | undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const location = searchParams.get('location') || undefined;
    const vintage = searchParams.get('vintage') || undefined;
    
    // Get marketplace service
    const marketplaceService = new CarbonMarketplaceService();
    
    // Get available credits
    const availableCredits = await marketplaceService.getAvailableCredits({
      creditType,
      verificationStandard,
      minPrice,
      maxPrice,
      location,
      vintage
    });
    
    return NextResponse.json({
      credits: availableCredits
    });
  } catch (error) {
    console.error('Error getting carbon credits:', error);
    
    return NextResponse.json(
      { error: 'Failed to get carbon credits' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/carbon/marketplace/purchase
 * Purchase carbon credits
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
    if (!body.creditId || !body.quantity) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Get marketplace service
    const marketplaceService = new CarbonMarketplaceService();
    
    // Purchase credits
    const purchaseResult = await marketplaceService.purchaseCredits(
      user.uid,
      body.creditId,
      body.quantity
    );
    
    return NextResponse.json({
      ...purchaseResult
    });
  } catch (error) {
    console.error('Error purchasing carbon credits:', error);
    
    return NextResponse.json(
      { error: 'Failed to purchase carbon credits' },
      { status: 500 }
    );
  }
}
