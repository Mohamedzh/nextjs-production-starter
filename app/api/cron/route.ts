/**
 * Cron Job API Endpoint
 * Secured by Bearer token authentication
 * Called by Railway cron scheduler for scheduled tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Verify Bearer token authentication
 */
function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  
  if (!env.CRON_SECRET) {
    logger.error('CRON_SECRET not configured');
    return false;
  }

  const expectedAuth = `Bearer ${env.CRON_SECRET}`;
  return authHeader === expectedAuth;
}

export async function GET(request: NextRequest) {
  // Verify authentication
  if (!verifyAuth(request)) {
    logger.warn({ 
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
    }, 'Unauthorized cron attempt');
    
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    logger.info('Executing cron job');

    // Add your cron job logic here
    // Example: Database cleanup, sending notifications, etc.
    
    // Example task: Log current status
    const result = {
      executedAt: new Date().toISOString(),
      tasks: [
        { name: 'example-task', status: 'completed' },
      ],
    };

    logger.info({ result }, 'Cron job completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Cron job executed successfully',
      ...result,
    });

  } catch (error) {
    logger.error({ error }, 'Cron job failed');
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Support both GET and POST for flexibility
  return GET(request);
}
