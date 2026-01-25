/**
 * Prisma Database Client
 * Always initialized - DATABASE_URL is required
 * Uses Prisma 7 with PostgreSQL adapter for optimal performance
 */

import { env } from './env';
import logger from './logger';

// Type will be imported dynamically
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaClient = any;

// Extend global type to include prisma for dev hot-reload
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient | undefined = undefined;

/**
 * Initialize Prisma Client with PostgreSQL adapter
 * Handles Turbopack hot-reload in development
 */
function initializePrisma(): PrismaClient {
  try {
    // Dynamic require to avoid build errors when Prisma Client isn't generated yet
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require('../app/generated/prisma');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg  } = require('@prisma/adapter-pg');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require('pg');

    // Create PostgreSQL connection pool
    const pool = new Pool({
      connectionString: env.DATABASE_URL,
    });

    // Create adapter for Prisma 7
    const adapter = new PrismaPg (pool);

    // Create Prisma Client instance
    const client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    logger.info('Prisma Client initialized successfully');
    return client;
  } catch (error) {
    logger.error({ error }, 'Failed to initialize Prisma Client');
    throw new Error('Database initialization failed. Run: npx prisma generate');
  }
}

/**
 * Get Prisma database client
 * Returns singleton instance (handles Turbopack hot-reload)
 * Note: This is async to support dynamic imports
 */
function getDb(): PrismaClient {
  // In development with Turbopack, use global variable to prevent hot-reload issues
  if (process.env.NODE_ENV !== 'production') {
    if (!global.prisma) {
      global.prisma = initializePrisma();
    }
    return global.prisma;
  }

  // In production, create singleton instance
  if (!prisma) {
    prisma = initializePrisma();
  }
  return prisma;
}

/**
 * Export db instance for direct use
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
