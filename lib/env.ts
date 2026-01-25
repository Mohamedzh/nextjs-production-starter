/**
 * Environment Variable Validation
 * Type-safe environment variables with runtime validation using Zod
 * All feature-specific variables are optional to support flexible deployments
 */

import { z } from "zod";

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // NextAuth Configuration (Optional - enables authentication features)
  NEXTAUTH_SECRET: z.string().min(32).nullish(),

  NEXTAUTH_URL: z.preprocess(
    // If it's an empty string, treat it as undefined
    (str) => process.env.NEXTAUTH_URL === "" ? undefined : str,
    z.string().optional()
  ),

  // Database Configuration (Required - Prisma ORM)
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Redis Configuration (Required - ISR caching)
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

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
    const parsed = envSchema.parse(process.env);

    const getNextAuthUrl = () => {
      // A. User defined override (e.g. Custom Domain)
      if (parsed.NEXTAUTH_URL) return parsed.NEXTAUTH_URL;

      // B. Railway Public Domain (Auto-injected by Railway)
      // Note: Railway sends "app.up.railway.app", so we must add "https://"
      if (process.env.RAILWAY_PUBLIC_DOMAIN) {
        return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
      }

      // C. Localhost fallback
      return "http://localhost:3000";
    };

    const resolvedUrl = getNextAuthUrl();

    process.env.NEXTAUTH_URL = resolvedUrl;

    return { ...parsed, NEXTAUTH_URL: resolvedUrl };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      console.error(error.flatten().fieldErrors);
      throw new Error("Invalid environment variables");
    }
    throw error;
  }
}

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
