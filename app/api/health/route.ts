/**
 * Health Check API Endpoint
 * Returns system status and feature availability
 * Used by Docker HEALTHCHECK and Railway monitoring
 */

import { NextResponse } from 'next/server';
import { features, getAuthStrategy } from '@/lib/features';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  features: {
    auth: {
      enabled: boolean;
      strategy?: 'jwt' | 'database';
      providers?: string[];
    };
    database: {
      enabled: boolean;
      status: 'connected' | 'error';
      error?: string;
    };
    redis: {
      enabled: boolean;
      status: 'disabled' | 'connected';
    };
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

export async function GET() {
  const startTime = Date.now();
  
  const status: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'unknown',
    features: {
      auth: {
        enabled: features.auth,
        ...(features.auth && {
          strategy: getAuthStrategy(),
          providers: [
            features.githubProvider && 'github',
            features.googleProvider && 'google',
            features.discordProvider && 'discord',
          ].filter(Boolean) as string[],
        }),
      },
      database: {
        enabled: true, // Always enabled
        status: 'connected', // Will be updated below
      },
      redis: {
        enabled: !!process.env.REDIS_URL,
        status: process.env.REDIS_URL ? 'connected' : 'disabled',
      },
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
    },
  };

  // Test database connection (always enabled)
  try {
    await db.$queryRaw`SELECT 1`;
    status.features.database.status = 'connected';
  } catch (error) {
    status.status = 'degraded';
    status.features.database.status = 'error';
    status.features.database.error = error instanceof Error ? error.message : 'Unknown error';
  }

  const responseTime = Date.now() - startTime;

  return NextResponse.json(
    {
      ...status,
      responseTime: `${responseTime}ms`,
    },
    {
      status: status.status === 'unhealthy' ? 503 : 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    }
  );
}
