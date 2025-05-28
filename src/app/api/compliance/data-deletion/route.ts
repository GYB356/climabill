import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { complianceService } from '@/lib/compliance/compliance-service';
import { logger } from '@/lib/monitoring/logger';

/**
 * API route for handling data deletion requests (GDPR Article 17 / CCPA Section 1798.105)
 * This allows users to request deletion of their personal data
 */
export async function POST(req: NextRequest) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Parse request body
    const body = await req.json();
    const { retainRequiredData = true, confirmationCode } = body;
    
    // Require a confirmation code for data deletion
    if (!confirmationCode || confirmationCode !== 'DELETE-MY-DATA') {
      return NextResponse.json(
        { error: 'Invalid confirmation code. Please enter "DELETE-MY-DATA" to confirm deletion.' },
        { status: 400 }
      );
    }
    
    // Process the data deletion request
    await complianceService.deleteUserData(userId, retainRequiredData);
    
    // Return success response
    return NextResponse.json(
      { 
        message: 'Your data deletion request has been processed successfully.',
        retainedData: retainRequiredData ? 
          'Some data has been retained for legal and business purposes.' : 
          'All data has been permanently deleted.'
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error processing data deletion request', { error });
    
    return NextResponse.json(
      { error: 'Failed to process data deletion request' },
      { status: 500 }
    );
  }
}

/**
 * API route for initiating an asynchronous data deletion request
 * For accounts with large datasets, this is preferable to avoid timeouts
 */
export async function PUT(req: NextRequest) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Parse request body
    const body = await req.json();
    const { retainRequiredData = true, confirmationCode } = body;
    
    // Require a confirmation code for data deletion
    if (!confirmationCode || confirmationCode !== 'DELETE-MY-DATA') {
      return NextResponse.json(
        { error: 'Invalid confirmation code. Please enter "DELETE-MY-DATA" to confirm deletion.' },
        { status: 400 }
      );
    }
    
    // Queue the deletion job asynchronously
    // In a real implementation, this would use a job queue like Bull
    setTimeout(async () => {
      try {
        await complianceService.deleteUserData(userId, retainRequiredData);
      } catch (error) {
        logger.error('Error in async data deletion job', { userId, error });
      }
    }, 0);
    
    return NextResponse.json(
      { 
        message: 'Data deletion request received. You will be notified when the process is complete.',
        requestId: `deletion-${Date.now()}`
      },
      { status: 202 }
    );
  } catch (error) {
    logger.error('Error initiating data deletion request', { error });
    
    return NextResponse.json(
      { error: 'Failed to initiate data deletion request' },
      { status: 500 }
    );
  }
}
