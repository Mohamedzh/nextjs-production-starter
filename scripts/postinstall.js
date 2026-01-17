#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Post-install script for conditional Prisma Client generation
 * Only generates Prisma Client if DATABASE_URL is set
 * This prevents build failures when database features are disabled
 */

const { execSync } = require('child_process');

const DATABASE_URL = process.env.DATABASE_URL;

if (DATABASE_URL) {
  console.log('✓ DATABASE_URL detected - generating Prisma Client...');
  try {
    execSync('prisma generate', { stdio: 'inherit' });
    console.log('✓ Prisma Client generated successfully');
  } catch (error) {
    console.error('✗ Failed to generate Prisma Client:', error.message);
    process.exit(1);
  }
} else {
  console.log('⚠ DATABASE_URL not set - skipping Prisma Client generation');
  console.log('  Set DATABASE_URL to enable database features');
}
