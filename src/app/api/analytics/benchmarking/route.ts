import { NextRequest, NextResponse } from 'next/server';
import { BenchmarkingService } from '@/lib/analytics/benchmarking/benchmarking-service';
import { Industry, MetricType } from '@/lib/analytics/benchmarking/types';
import { getCurrentUser } from '@/lib/firebase/auth-admin';

/**
 * GET /api/analytics/benchmarking
 * Get industry benchmarks for an organization
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
    const metricsParam = searchParams.get('metrics');
    
    // Validate required parameters
    if (!organizationId || !industryId) {
      return NextResponse.json(
        { error: 'Missing required parameters: organizationId and industryId are required' },
        { status: 400 }
      );
    }
    
    // Parse metrics
    const metrics = metricsParam ? 
      metricsParam.split(',').map(m => m as MetricType) : 
      [MetricType.CARBON_EMISSIONS];
    
    // Get benchmarking service
    const benchmarkingService = new BenchmarkingService();
    
    // Get industry benchmarks
    const benchmarks = await benchmarkingService.getIndustryBenchmarks(
      organizationId,
      industryId,
      metrics
    );
    
    return NextResponse.json({
      benchmarks
    });
  } catch (error) {
    console.error('Error getting industry benchmarks:', error);
    
    return NextResponse.json(
      { error: 'Failed to get industry benchmarks' },
      { status: 500 }
    );
  }
}
