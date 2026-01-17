/**
 * Environment Variable Validation
 * Type-safe environment variables with runtime validation using Zod
 * All feature-specific variables are optional to support flexible deployments
 */

import { z } from 'zod';

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // NextAuth Configuration (Optional - enables authentication features)
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().optional(),
  
  // Database Configuration (Optional - enables Prisma ORM)
  DATABASE_URL: z.string().optional(),
  
  // Redis Configuration (Optional - enables ISR caching)
  REDIS_URL: z.string().optional(),
  
  // Cron Secret (Optional - secures cron endpoints)
  CRON_SECRET: z.string().min(32).optional(),
  
  // OAuth Providers (Optional - enables social login)
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  GOOGLE_ID: z.string().optional(),
  GOOGLE_SECRET: z.string().optional(),
  DISCORD_ID: z.string().optional(),
  DISCORD_SECRET: z.string().optional(),

});

// Parse and validate environment variables
// This runs at import time, so any errors will be caught immediately on startup
function validateEnv() {
  try {
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      DATABASE_URL: process.env.DATABASE_URL,
      REDIS_URL: process.env.REDIS_URL,
      CRON_SECRET: process.env.CRON_SECRET,
      GITHUB_ID: process.env.GITHUB_ID,
      GITHUB_SECRET: process.env.GITHUB_SECRET,
      GOOGLE_ID: process.env.GOOGLE_ID,
      GOOGLE_SECRET: process.env.GOOGLE_SECRET,
      DISCORD_ID: process.env.DISCORD_ID,
      DISCORD_SECRET: process.env.DISCORD_SECRET,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      console.error(error.flatten().fieldErrors);
      throw new Error('Invalid environment variables');
    }
    throw error;
  }
}

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
