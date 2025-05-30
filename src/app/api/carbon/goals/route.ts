import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CarbonGoalsService } from '@/lib/carbon/carbon-goals-service';
import { CarbonReductionGoal } from '@/lib/carbon/models/department-project';

// GET /api/carbon/goals
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if this is a specific goal request (handled by the [id] route)
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    if (pathParts.length > 5) {
      // This is a request for a specific goal or progress, should be handled by the [id] route
      return NextResponse.json({ error: 'Invalid route' }, { status: 400 });
    }
    
    const { searchParams } = url;
    const organizationId = searchParams.get('organizationId') || session.user.id;
    const departmentId = searchParams.get('departmentId') || undefined;
    const projectId = searchParams.get('projectId') || undefined;
    const status = searchParams.get('status') as 'active' | 'completed' | 'all' || 'all';
    
    const goalsService = new CarbonGoalsService();
    const goals = await goalsService.getGoals(organizationId, departmentId, projectId, status);
    
    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Error fetching carbon reduction goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carbon reduction goals' },
      { status: 500 }
    );
  }
}

// POST /api/carbon/goals
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const {
      name,
      description,
      organizationId,
      departmentId,
      projectId,
      baselineCarbonInKg,
      targetCarbonInKg,
      targetReductionPercentage,
      startDate,
      targetDate,
      status
    } = body;
    
    if (!name || !baselineCarbonInKg || !targetReductionPercentage || !startDate || !targetDate) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }
    
    // Use the provided organizationId or default to the user's ID
    const goalOrganizationId = organizationId || session.user.id;
    
    const goalsService = new CarbonGoalsService();
    const goal = await goalsService.createGoal({
      name,
      description,
      organizationId: goalOrganizationId,
      departmentId,
      projectId,
      baselineCarbonInKg,
      targetCarbonInKg,
      targetReductionPercentage,
      startDate: new Date(startDate),
      targetDate: new Date(targetDate),
      status: status || 'active'
    });
    
    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error('Error creating carbon reduction goal:', error);
    return NextResponse.json(
      { error: 'Failed to create carbon reduction goal' },
      { status: 500 }
    );
  }
}
