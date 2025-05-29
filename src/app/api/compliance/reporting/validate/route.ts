import { NextRequest, NextResponse } from 'next/server';
import { ComplianceReportingService } from '@/lib/reporting/compliance/compliance-reporting-service';
import { ComplianceFramework } from '@/lib/reporting/compliance/types';
import { getCurrentUser } from '@/lib/firebase/auth-admin';

/**
 * GET /api/compliance/reporting/validate
 * Validate compliance data for a specific framework
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
    const framework = searchParams.get('framework') as ComplianceFramework | null;
    
    // Validate required parameters
    if (!organizationId || !framework) {
      return NextResponse.json(
        { error: 'Missing required parameters: organizationId and framework are required' },
        { status: 400 }
      );
    }
    
    // Validate framework
    if (!Object.values(ComplianceFramework).includes(framework)) {
      return NextResponse.json(
        { error: 'Invalid compliance framework' },
        { status: 400 }
      );
    }
    
    // Get compliance reporting service
    const reportingService = new ComplianceReportingService();
    
    // Validate compliance data
    const validationResult = await reportingService.validateComplianceData(
      organizationId,
      framework
    );
    
    return NextResponse.json({
      validationResult
    });
  } catch (error) {
    console.error('Error validating compliance data:', error);
    
    return NextResponse.json(
      { error: 'Failed to validate compliance data' },
      { status: 500 }
    );
  }
}
