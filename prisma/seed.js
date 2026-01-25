/**
 * Database Seed Script
 * Creates example data for development
 * Only runs when NODE_ENV=development
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('../app/generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

// Create PostgreSQL adapter for Prisma 7
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  if (process.env.NODE_ENV !== 'development') {
    console.log('⚠️  Seeding is only available in development mode');
    return;
  }

  console.log('🌱 Seeding database...');

  // Example: Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created test user:', user);

  // Add your custom seed data here

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
