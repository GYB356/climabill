import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { SubscriptionService, SubscriptionTier } from '@/lib/billing/subscription-service';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET handler for retrieving a specific subscription
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const subscriptionId = params.id;
    
    // Get the subscription
    const subscription = await SubscriptionService.getSubscription(subscriptionId);
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    // Check if the subscription belongs to the authenticated user
    if (subscription.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler for updating a subscription
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const subscriptionId = params.id;
    
    // Get the subscription
    const subscription = await SubscriptionService.getSubscription(subscriptionId);
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    // Check if the subscription belongs to the authenticated user
    if (subscription.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const { action, tier } = await request.json();
    
    // Handle different update actions
    if (action === 'cancel') {
      const immediately = request.nextUrl.searchParams.get('immediately') === 'true';
      const updatedSubscription = await SubscriptionService.cancelSubscription(
        subscriptionId,
        immediately
      );
      
      return NextResponse.json({ subscription: updatedSubscription });
    } else if (action === 'change_tier') {
      // Validate tier
      if (!tier || !Object.values(SubscriptionTier).includes(tier as SubscriptionTier)) {
        return NextResponse.json(
          { error: 'Invalid subscription tier' },
          { status: 400 }
        );
      }
      
      const updatedSubscription = await SubscriptionService.changeSubscriptionTier(
        subscriptionId,
        tier as SubscriptionTier
      );
      
      return NextResponse.json({ subscription: updatedSubscription });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
