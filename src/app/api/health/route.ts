import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';

/**
 * Health check endpoint for monitoring and Kubernetes probes
 * Returns system health status and basic metrics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check database connection
    const dbStartTime = Date.now();
    await firestore.collection('health').doc('ping').set({
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    const dbEndTime = Date.now();
    const dbLatency = dbEndTime - dbStartTime;

    // Get system info
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const freeMemory = memoryUsage.heapTotal - memoryUsage.heapUsed;

    // Build response
    const healthData = {
      status: 'healthy',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      database: {
        status: 'connected',
        latency: dbLatency,
      },
      memory: {
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        free: Math.round(freeMemory / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
      },
      environment: process.env.NODE_ENV,
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 500 }
    );
  }
}
