import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { complianceService } from '@/lib/compliance/compliance-service';
import { logger } from '@/lib/monitoring/logger';
import { ConsentType, ConsentStatus } from '@prisma/client';

/**
 * API route for retrieving user consent settings
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
    
    // Retrieve user consents
    const consents = await complianceService.getUserConsents(userId);
    
    // Return the consents
    return NextResponse.json(consents, { status: 200 });
  } catch (error) {
    logger.error('Error retrieving user consents', { error });
    
    return NextResponse.json(
      { error: 'Failed to retrieve user consents' },
      { status: 500 }
    );
  }
}

/**
 * API route for updating user consent settings
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
    const { type, status, source } = body;
    
    // Validate request parameters
    if (!type || !Object.values(ConsentType).includes(type as ConsentType)) {
      return NextResponse.json(
        { error: 'Invalid consent type' },
        { status: 400 }
      );
    }
    
    if (!status || !Object.values(ConsentStatus).includes(status as ConsentStatus)) {
      return NextResponse.json(
        { error: 'Invalid consent status' },
        { status: 400 }
      );
    }
    
    if (!source) {
      return NextResponse.json(
        { error: 'Source is required' },
        { status: 400 }
      );
    }
    
    // Record the consent
    const consent = await complianceService.recordConsent(
      userId,
      type as ConsentType,
      status as ConsentStatus,
      source
    );
    
    // Return the updated consent
    return NextResponse.json(consent, { status: 200 });
  } catch (error) {
    logger.error('Error updating user consent', { error });
    
    return NextResponse.json(
      { error: 'Failed to update user consent' },
      { status: 500 }
    );
  }
}

/**
 * API route for bulk updating user consent settings
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
    const { consents, source } = body;
    
    if (!Array.isArray(consents) || !source) {
      return NextResponse.json(
        { error: 'Invalid request format. Expected consents array and source.' },
        { status: 400 }
      );
    }
    
    // Process each consent update
    const results = [];
    for (const { type, status } of consents) {
      if (
        !type || 
        !Object.values(ConsentType).includes(type as ConsentType) ||
        !status || 
        !Object.values(ConsentStatus).includes(status as ConsentStatus)
      ) {
        continue; // Skip invalid entries
      }
      
      try {
        const consent = await complianceService.recordConsent(
          userId,
          type as ConsentType,
          status as ConsentStatus,
          source
        );
        results.push(consent);
      } catch (error) {
        logger.error('Error updating consent in bulk operation', { type, error });
      }
    }
    
    // Return the updated consents
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    logger.error('Error processing bulk consent update', { error });
    
    return NextResponse.json(
      { error: 'Failed to process bulk consent update' },
      { status: 500 }
    );
  }
}
