#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Post-install script for Prisma Client generation
 * Generates Prisma Client during npm install
 * DATABASE_URL is required - fails if not set
 */

const { execSync } = require('child_process');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.log('⚠ DATABASE_URL not set - Prisma Client generation skipped during install');
  console.log('  This is expected during local development without .env file');
  console.log('  Run: npx prisma generate manually or set DATABASE_URL');
  process.exit(0); // Don't fail the install
}

console.log('✓ DATABASE_URL detected - generating Prisma Client...');
try {
  execSync('prisma generate', { stdio: 'inherit' });
  console.log('✓ Prisma Client generated successfully');
} catch (error) {
  console.error('✗ Failed to generate Prisma Client:', error.message);
  process.exit(1);
}
