import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CarbonGoalsService } from '@/lib/carbon/carbon-goals-service';

// GET /api/carbon/goals/[id]/progress
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
        { error: 'Unauthorized to view this goal' },
        { status: 403 }
      );
    }
    
    const progress = await goalsService.updateGoalProgress(id);
    
    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error fetching goal progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal progress' },
      { status: 500 }
    );
  }
}
