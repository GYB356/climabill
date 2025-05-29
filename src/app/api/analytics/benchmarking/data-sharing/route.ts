import { NextRequest, NextResponse } from 'next/server';
import { BenchmarkingService } from '@/lib/analytics/benchmarking/benchmarking-service';
import { SharingPreferences, MetricType } from '@/lib/analytics/benchmarking/types';
import { getCurrentUser } from '@/lib/firebase/auth-admin';

/**
 * POST /api/analytics/benchmarking/data-sharing
 * Opt in to anonymous data sharing
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
    if (!body.organizationId || !body.sharingPreferences) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Validate sharing preferences
    const sharingPreferences = body.sharingPreferences as SharingPreferences;
    
    if (typeof sharingPreferences.shareAnonymousData !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid sharing preferences: shareAnonymousData must be a boolean' },
        { status: 400 }
      );
    }
    
    // Get benchmarking service
    const benchmarkingService = new BenchmarkingService();
    
    // Opt in to data sharing
    await benchmarkingService.optInToDataSharing(
      body.organizationId,
      sharingPreferences
    );
    
    return NextResponse.json({
      success: true,
      message: 'Successfully opted in to data sharing'
    });
  } catch (error) {
    console.error('Error opting in to data sharing:', error);
    
    return NextResponse.json(
      { error: 'Failed to opt in to data sharing' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/benchmarking/data-sharing
 * Get data sharing preferences
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
    
    // Validate required parameters
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Missing required parameter: organizationId' },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would fetch from a database
    // For now, we'll return mock data
    const sharingPreferences: SharingPreferences = {
      shareAnonymousData: true,
      shareMetrics: [
        MetricType.CARBON_EMISSIONS,
        MetricType.ENERGY_USAGE,
        MetricType.WATER_USAGE
      ],
      shareIndustryInfo: true,
      shareCompanySize: true
    };
    
    return NextResponse.json({
      sharingPreferences
    });
  } catch (error) {
    console.error('Error getting data sharing preferences:', error);
    
    return NextResponse.json(
      { error: 'Failed to get data sharing preferences' },
      { status: 500 }
    );
  }
}
