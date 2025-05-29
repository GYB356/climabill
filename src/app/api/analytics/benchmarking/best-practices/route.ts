import { NextRequest, NextResponse } from 'next/server';
import { BenchmarkingService } from '@/lib/analytics/benchmarking/benchmarking-service';
import { Industry } from '@/lib/analytics/benchmarking/types';
import { getCurrentUser } from '@/lib/firebase/auth-admin';

/**
 * GET /api/analytics/benchmarking/best-practices
 * Get best practice recommendations for an organization
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
    const organizationId = searchParams.get('organizationId');
    const industryId = searchParams.get('industryId') as Industry | null;
    
    // Validate required parameters
    if (!organizationId || !industryId) {
      return NextResponse.json(
        { error: 'Missing required parameters: organizationId and industryId are required' },
        { status: 400 }
      );
    }
    
    // Get benchmarking service
    const benchmarkingService = new BenchmarkingService();
    
    // Get best practice recommendations
    const bestPractices = await benchmarkingService.getBestPracticeRecommendations(
      organizationId,
      industryId
    );
    
    return NextResponse.json({
      bestPractices
    });
  } catch (error) {
    console.error('Error getting best practice recommendations:', error);
    
    return NextResponse.json(
      { error: 'Failed to get best practice recommendations' },
      { status: 500 }
    );
  }
}
