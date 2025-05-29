import { NextRequest, NextResponse } from 'next/server';
import { ComplianceReportingService } from '@/lib/reporting/compliance/compliance-reporting-service';
import { ComplianceFramework, ReportFormat } from '@/lib/reporting/compliance/types';
import { getCurrentUser } from '@/lib/firebase/auth-admin';

/**
 * POST /api/compliance/reporting/generate
 * Generate a compliance report
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
    if (!body.organizationId || !body.framework || !body.period) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Validate framework
    if (!Object.values(ComplianceFramework).includes(body.framework)) {
      return NextResponse.json(
        { error: 'Invalid compliance framework' },
        { status: 400 }
      );
    }
    
    // Validate period
    if (!body.period.startDate || !body.period.endDate) {
      return NextResponse.json(
        { error: 'Invalid period' },
        { status: 400 }
      );
    }
    
    // Parse dates
    const startDate = new Date(body.period.startDate);
    const endDate = new Date(body.period.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }
    
    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }
    
    // Validate format if provided
    let format = ReportFormat.PDF;
    if (body.format) {
      if (!Object.values(ReportFormat).includes(body.format)) {
        return NextResponse.json(
          { error: 'Invalid report format' },
          { status: 400 }
        );
      }
      format = body.format;
    }
    
    // Get compliance reporting service
    const reportingService = new ComplianceReportingService();
    
    // Generate report
    const report = await reportingService.generateComplianceReport(
      body.organizationId,
      body.framework,
      { startDate, endDate },
      format
    );
    
    return NextResponse.json({
      report
    });
  } catch (error) {
    console.error('Error generating compliance report:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate compliance report' },
      { status: 500 }
    );
  }
}
