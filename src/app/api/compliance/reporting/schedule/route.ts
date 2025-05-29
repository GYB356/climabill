import { NextRequest, NextResponse } from 'next/server';
import { ComplianceReportingService } from '@/lib/reporting/compliance/compliance-reporting-service';
import { ComplianceFramework, ReportFormat, ReportFrequency } from '@/lib/reporting/compliance/types';
import { getCurrentUser } from '@/lib/firebase/auth-admin';

/**
 * POST /api/compliance/reporting/schedule
 * Schedule a compliance report
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
    if (!body.organizationId || !body.framework || !body.frequency || !body.format || !body.recipients) {
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
    
    // Validate frequency
    if (!Object.values(ReportFrequency).includes(body.frequency)) {
      return NextResponse.json(
        { error: 'Invalid report frequency' },
        { status: 400 }
      );
    }
    
    // Validate format
    if (!Object.values(ReportFormat).includes(body.format)) {
      return NextResponse.json(
        { error: 'Invalid report format' },
        { status: 400 }
      );
    }
    
    // Validate recipients
    if (!Array.isArray(body.recipients) || body.recipients.length === 0) {
      return NextResponse.json(
        { error: 'At least one recipient is required' },
        { status: 400 }
      );
    }
    
    // Validate custom schedule if frequency is CUSTOM
    if (body.frequency === ReportFrequency.CUSTOM) {
      if (!body.customSchedule || !body.customSchedule.months || !Array.isArray(body.customSchedule.months) || body.customSchedule.months.length === 0) {
        return NextResponse.json(
          { error: 'Custom schedule must include at least one month' },
          { status: 400 }
        );
      }
      
      // Validate months (0-11)
      for (const month of body.customSchedule.months) {
        if (typeof month !== 'number' || month < 0 || month > 11) {
          return NextResponse.json(
            { error: 'Custom schedule months must be between 0 and 11' },
            { status: 400 }
          );
        }
      }
      
      // Validate day of month if provided
      if (body.customSchedule.dayOfMonth !== undefined) {
        if (typeof body.customSchedule.dayOfMonth !== 'number' || body.customSchedule.dayOfMonth < 1 || body.customSchedule.dayOfMonth > 28) {
          return NextResponse.json(
            { error: 'Custom schedule day of month must be between 1 and 28' },
            { status: 400 }
          );
        }
      }
    }
    
    // Get compliance reporting service
    const reportingService = new ComplianceReportingService();
    
    // Schedule report
    const scheduleResult = await reportingService.scheduleReportGeneration(
      body.organizationId,
      body.framework,
      {
        frequency: body.frequency,
        format: body.format,
        recipients: body.recipients,
        customSchedule: body.customSchedule,
        enabled: body.enabled !== false // Default to enabled if not specified
      }
    );
    
    return NextResponse.json({
      schedule: scheduleResult
    });
  } catch (error) {
    console.error('Error scheduling compliance report:', error);
    
    return NextResponse.json(
      { error: 'Failed to schedule compliance report' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/reporting/schedule
 * Get scheduled reports for an organization
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
    const schedules = [
      {
        id: 'schedule-001',
        organizationId,
        framework: ComplianceFramework.GHG_PROTOCOL,
        frequency: ReportFrequency.ANNUALLY,
        format: ReportFormat.PDF,
        recipients: ['admin@example.com'],
        nextRunDate: new Date(new Date().getFullYear() + 1, 0, 1),
        enabled: true
      },
      {
        id: 'schedule-002',
        organizationId,
        framework: ComplianceFramework.TCFD,
        frequency: ReportFrequency.QUARTERLY,
        format: ReportFormat.PDF,
        recipients: ['admin@example.com', 'sustainability@example.com'],
        nextRunDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3 + 3, 1),
        enabled: true
      }
    ];
    
    return NextResponse.json({
      schedules
    });
  } catch (error) {
    console.error('Error getting scheduled reports:', error);
    
    return NextResponse.json(
      { error: 'Failed to get scheduled reports' },
      { status: 500 }
    );
  }
}
