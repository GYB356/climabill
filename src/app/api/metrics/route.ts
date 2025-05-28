import { NextRequest, NextResponse } from 'next/server';
import client from 'prom-client';

// Create a Registry to register metrics
const register = new client.Registry();

// Add default metrics (GC, memory usage, event loop lag, etc.)
client.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

const activeUsers = new client.Gauge({
  name: 'active_users',
  help: 'Number of active users in the last 24 hours',
  registers: [register],
});

const invoicesCreated = new client.Counter({
  name: 'invoices_created_total',
  help: 'Total number of invoices created',
  registers: [register],
});

const paymentsProcessed = new client.Counter({
  name: 'payments_processed_total',
  help: 'Total number of payments processed',
  labelNames: ['status', 'provider'],
  registers: [register],
});

const carbonOffsetsTotal = new client.Counter({
  name: 'carbon_offsets_total',
  help: 'Total carbon offsets purchased in tonnes',
  registers: [register],
});

const blockchainTransactionsTotal = new client.Counter({
  name: 'blockchain_transactions_total',
  help: 'Total number of blockchain transactions',
  labelNames: ['network', 'status'],
  registers: [register],
});

// Export metrics for Prometheus
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Update some metrics with mock data for now
    // In production, these would be updated throughout the application
    activeUsers.set(Math.floor(Math.random() * 100) + 50);
    
    // Generate metrics in Prometheus format
    const metrics = await register.metrics();
    
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return NextResponse.json(
      { error: 'Error generating metrics' },
      { status: 500 }
    );
  }
}

// Export metrics objects for use in other parts of the application
export {
  httpRequestsTotal,
  httpRequestDurationSeconds,
  activeUsers,
  invoicesCreated,
  paymentsProcessed,
  carbonOffsetsTotal,
  blockchainTransactionsTotal,
};
