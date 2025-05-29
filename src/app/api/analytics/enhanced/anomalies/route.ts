import { NextRequest, NextResponse } from 'next/server';
import { EnhancedAnalyticsService } from '@/lib/analytics/enhanced/enhanced-analytics-service';
import { AnomalyDetectionConfig } from '@/lib/analytics/enhanced/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API route for detecting anomalies
 */
export async function POST(request: NextRequest) {
  try {
    // Get session and validate authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { organizationId, config } = body;

    // Validate required fields
    if (!organizationId || !config) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId and config are required' },
        { status: 400 }
      );
    }

    // Validate config
    if (!config.method || !config.metrics || !config.sensitivityLevel) {
      return NextResponse.json(
        { error: 'Invalid config: method, metrics, and sensitivityLevel are required' },
        { status: 400 }
      );
    }

    // Detect anomalies
    const analyticsService = new EnhancedAnalyticsService();
    const result = await analyticsService.detectAnomalies(organizationId, config as AnomalyDetectionConfig);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
