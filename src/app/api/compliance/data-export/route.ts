import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { complianceService } from '@/lib/compliance/compliance-service';
import { logger } from '@/lib/monitoring/logger';

/**
 * API route for handling data export requests (GDPR Article 15 / CCPA Section 1798.100)
 * This allows users to download all their personal data
 */
export async function GET(req: NextRequest) {
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
    
    // Process the data export request
    const exportData = await complianceService.exportUserData(userId);
    
    // Return the data as JSON
    return NextResponse.json(exportData, { status: 200 });
  } catch (error) {
    logger.error('Error processing data export request', { error });
    
    return NextResponse.json(
      { error: 'Failed to process data export request' },
      { status: 500 }
    );
  }
}

/**
 * API route for initiating an asynchronous data export
 * For large datasets, this is preferable to avoid timeouts
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
    
    // Queue the export job asynchronously
    // In a real implementation, this would use a job queue like Bull
    setTimeout(async () => {
      try {
        await complianceService.exportUserData(userId);
      } catch (error) {
        logger.error('Error in async data export job', { userId, error });
      }
    }, 0);
    
    return NextResponse.json(
      { 
        message: 'Data export request received. You will be notified when it is ready for download.',
        requestId: `export-${Date.now()}`
      },
      { status: 202 }
    );
  } catch (error) {
    logger.error('Error initiating data export request', { error });
    
    return NextResponse.json(
      { error: 'Failed to initiate data export request' },
      { status: 500 }
    );
  }
}
