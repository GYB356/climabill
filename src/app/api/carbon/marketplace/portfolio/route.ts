import { NextRequest, NextResponse } from 'next/server';
import { CarbonMarketplaceService } from '@/lib/carbon/marketplace/marketplace-service';
import { getCurrentUser } from '@/lib/firebase/auth-admin';

/**
 * GET /api/carbon/marketplace/portfolio
 * Get user's carbon credit portfolio
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
    
    // Get marketplace service
    const marketplaceService = new CarbonMarketplaceService();
    
    // Get user portfolio
    const portfolio = await marketplaceService.getUserPortfolio(user.uid);
    
    return NextResponse.json({
      portfolio
    });
  } catch (error) {
    console.error('Error getting carbon credit portfolio:', error);
    
    return NextResponse.json(
      { error: 'Failed to get carbon credit portfolio' },
      { status: 500 }
    );
  }
}
