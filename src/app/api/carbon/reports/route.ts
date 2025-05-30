import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SustainabilityReportingService } from '@/lib/carbon/sustainability-reporting-service';

// GET /api/carbon/reports
export async function GET(req: NextRequest, { params }: { params?: { id?: string } } = {}) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // If we have an ID parameter, get a specific report
    if (params?.id) {
      const reportingService = new SustainabilityReportingService();
      const report = await reportingService.getReport(params.id);
      
      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }
      
      // Check if the user is authorized to view this report
      if (report.organizationId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized to view this report' }, { status: 403 });
      }
      
      return NextResponse.json({ report });
    }
    
    // Otherwise, get a list of reports
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId') || session.user.id;
    const departmentId = searchParams.get('departmentId') || undefined;
    const projectId = searchParams.get('projectId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    const reportingService = new SustainabilityReportingService();
    const reports = await reportingService.getReports(
      organizationId,
      undefined,
      departmentId,
      projectId,
      limit
    );
    
    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching sustainability reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sustainability reports' },
      { status: 500 }
    );
  }
}

// POST /api/carbon/reports
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const {
      organizationId,
      reportType,
      startDate,
      endDate,
      departmentId,
      projectId
    } = body;
    
    if (!reportType || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Report type, start date, and end date are required' },
        { status: 400 }
      );
    }
    
    // Use the provided organizationId or default to the user's ID
    const reportOrganizationId = organizationId || session.user.id;
    
    const reportingService = new SustainabilityReportingService();
    const report = await reportingService.generateReport(
      reportOrganizationId,
      reportType,
      new Date(startDate),
      new Date(endDate),
      departmentId,
      projectId
    );
    
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error('Error generating sustainability report:', error);
    return NextResponse.json(
      { error: 'Failed to generate sustainability report' },
      { status: 500 }
    );
  }
}

// DELETE /api/carbon/reports/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }
    
    const reportingService = new SustainabilityReportingService();
    
    // Verify the report belongs to the user's organization
    const report = await reportingService.getReport(id);
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    if (report.organizationId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this report' },
        { status: 403 }
      );
    }
    
    await reportingService.deleteReport(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sustainability report:', error);
    return NextResponse.json(
      { error: 'Failed to delete sustainability report' },
      { status: 500 }
    );
  }
}
