import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { SubscriptionService, SubscriptionTier, SubscriptionProvider } from '@/lib/billing/subscription-service';
import { StripeService } from '@/lib/billing/stripe/stripe-service';

/**
 * GET handler for retrieving user subscriptions
 */
export async function GET(request: NextRequest) {
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
    
    // Get active subscription or all subscriptions
    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get('active') === 'true';
    
    if (active) {
      const subscription = await SubscriptionService.getUserActiveSubscription(userId);
      return NextResponse.json({ subscription });
    } else {
      const subscriptions = await SubscriptionService.getUserSubscriptions(userId);
      return NextResponse.json({ subscriptions });
    }
  } catch (error) {
    console.error('Error retrieving subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new subscription checkout session
 */
export async function POST(request: NextRequest) {
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
    const { provider, tier, trialDays } = await request.json();
    
    // Validate required fields
    if (!provider || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate provider
    if (provider !== 'stripe' && provider !== 'paypal') {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }
    
    // Validate tier
    if (!Object.values(SubscriptionTier).includes(tier as SubscriptionTier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }
    
    // Check if user already has an active subscription
    const activeSubscription = await SubscriptionService.getUserActiveSubscription(userId);
    
    if (activeSubscription) {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      );
    }
    
    // Create checkout session based on provider
    let checkoutUrl = '';
    let customerId = '';
    
    if (provider === 'stripe') {
      // Check if user already has a Stripe customer ID
      // This would typically be stored in your user database
      // For simplicity, we'll create a new customer
      const user = session.user;
      const customer = await StripeService.createCustomer(
        user.email as string,
        user.name || undefined,
        { userId }
      );
      
      customerId = customer.id;
      
      checkoutUrl = await SubscriptionService.createStripeCheckoutSession(
        userId,
        customerId,
        tier as SubscriptionTier,
        trialDays
      );
    } else if (provider === 'paypal') {
      // For PayPal, we'll use the user ID as the customer ID
      customerId = userId;
      
      checkoutUrl = await SubscriptionService.createPayPalSubscription(
        userId,
        customerId,
        tier as SubscriptionTier
      );
    }
    
    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
