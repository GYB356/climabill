import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { ChurnPredictionService } from '@/lib/ai/churn-prediction';

/**
 * GET handler for retrieving churn prediction for a customer
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
    
    // Get customer ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId') || session.user.id;
    
    // Check if user has admin role to access other customer predictions
    const isAdmin = session.user.role === 'admin';
    
    if (customerId !== session.user.id && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You can only access your own predictions' },
        { status: 403 }
      );
    }
    
    // Get latest prediction or generate a new one
    const churnService = new ChurnPredictionService();
    let prediction = await churnService.getLatestChurnPrediction(customerId);
    
    // If no prediction exists or it's older than 7 days, generate a new one
    if (!prediction || isPredictionStale(prediction.createdAt)) {
      prediction = await churnService.predictChurnForCustomer(customerId);
    }
    
    return NextResponse.json({ prediction });
  } catch (error) {
    console.error('Error retrieving churn prediction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for generating a new churn prediction
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
    
    // Get request body
    const body = await request.json();
    const { customerId } = body;
    
    // Check if user has admin role to generate predictions for other customers
    const isAdmin = session.user.role === 'admin';
    
    if ((!customerId || customerId !== session.user.id) && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You can only generate predictions for yourself' },
        { status: 403 }
      );
    }
    
    // Use the provided customer ID or fall back to the authenticated user's ID
    const targetCustomerId = customerId || session.user.id;
    
    // Generate a new prediction
    const churnService = new ChurnPredictionService();
    const prediction = await churnService.predictChurnForCustomer(targetCustomerId);
    
    return NextResponse.json({ prediction });
  } catch (error) {
    console.error('Error generating churn prediction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Check if a prediction is stale (older than 7 days)
 * @param createdAt Prediction creation date
 * @returns Whether the prediction is stale
 */
function isPredictionStale(createdAt: any): boolean {
  const predictionDate = createdAt instanceof Date 
    ? createdAt 
    : createdAt.toDate();
  
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return predictionDate < sevenDaysAgo;
}
