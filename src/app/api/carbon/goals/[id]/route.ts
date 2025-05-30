import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CarbonGoalsService } from '@/lib/carbon/carbon-goals-service';

// GET /api/carbon/goals/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }
    
    const goalsService = new CarbonGoalsService();
    const goal = await goalsService.getGoal(id);
    
    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }
    
    // Verify the goal belongs to the user's organization
    if (goal.organizationId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized to view this goal' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Error fetching carbon reduction goal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carbon reduction goal' },
      { status: 500 }
    );
  }
}

// PUT /api/carbon/goals/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    const {
      name,
      description,
      baselineCarbonInKg,
      targetCarbonInKg,
      targetReductionPercentage,
      startDate,
      targetDate,
      status
    } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Goal name is required' },
        { status: 400 }
      );
    }
    
    const goalsService = new CarbonGoalsService();
    
    // Verify the goal belongs to the user's organization
    const goal = await goalsService.getGoal(id);
    
    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }
    
    if (goal.organizationId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized to update this goal' },
        { status: 403 }
      );
    }
    
    const updatedGoal = await goalsService.updateGoal(id, {
      name,
      description,
      baselineCarbonInKg,
      targetCarbonInKg,
      targetReductionPercentage,
      startDate: startDate ? new Date(startDate) : undefined,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      status
    });
    
    return NextResponse.json({ goal: updatedGoal }, { status: 200 });
  } catch (error) {
    console.error('Error updating carbon reduction goal:', error);
    return NextResponse.json(
      { error: 'Failed to update carbon reduction goal' },
      { status: 500 }
    );
  }
}

// DELETE /api/carbon/goals/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }
    
    const goalsService = new CarbonGoalsService();
    
    // Verify the goal belongs to the user's organization
    const goal = await goalsService.getGoal(id);
    
    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }
    
    if (goal.organizationId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this goal' },
        { status: 403 }
      );
    }
    
    await goalsService.deleteGoal(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting carbon reduction goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete carbon reduction goal' },
      { status: 500 }
    );
  }
}
