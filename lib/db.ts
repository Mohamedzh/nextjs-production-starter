/**
 * Prisma Database Client
 * Conditionally initialized based on DATABASE_URL presence
 * Returns null when database is not configured to prevent build failures
 */

import { features } from './features';

// Type will be set dynamically when client is available
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaClient = any;

// Extend global type to include prisma for dev hot-reload
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient | null = null;

/**
 * Get Prisma database client
 * Returns null if DATABASE_URL is not configured
 * This allows builds to succeed even without database connection
 */
export function getDb(): PrismaClient | null {
  // If database feature is disabled, return null immediately
  if (!features.database) {
    return null;
  }

  // Return existing instance if available
  if (prisma) {
    return prisma;
  }

  try {
    // Dynamically import Prisma Client from custom output location
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require('../app/generated/prisma');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPostgres } = require('@prisma/adapter-pg');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require('pg');

    // Create PostgreSQL connection pool
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Create adapter for Prisma 7
    const adapter = new PrismaPostgres(pool);

    // In development, use global variable to prevent hot-reload issues
    if (process.env.NODE_ENV !== 'production') {
      if (!global.prisma) {
        global.prisma = new PrismaClient({
          adapter,
          log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });
      }
      prisma = global.prisma;
    } else {
      // In production, create new instance
      prisma = new PrismaClient({
        adapter,
        log: ['error'],
      });
    }

    return prisma;
  } catch {
    // Prisma client not generated yet or other error
    // This is expected when DATABASE_URL is not set
    if (process.env.NODE_ENV === 'development') {
      console.warn('Prisma Client not available. Run `prisma generate` with DATABASE_URL set.');
    }
    return null;
  }
}

/**
 * Export db instance for convenience
 * Will be null if database is not configured
 */
export const db = getDb();

/**
 * Disconnect from database
 * Call this in serverless cleanup or testing teardown
 */
export async function disconnectDb(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}
