/**
 * Feature Detection
 * Auto-detects enabled features based on environment variable presence
 * 
 * NOTE: PostgreSQL is always required (checked in env.ts)
 * Redis is optional and handled automatically by cache-handler.mjs (no check needed)
 * Only auth and OAuth providers are checked here
 */

export const features = {
  /** Authentication enabled when NEXTAUTH_SECRET is set */
  get auth() {
    return !!process.env.NEXTAUTH_SECRET;
  },
  
  /** GitHub OAuth provider enabled when GITHUB_ID and GITHUB_SECRET are set */
  get githubProvider() {
    return !!(process.env.GITHUB_ID && process.env.GITHUB_SECRET);
  },
  
  /** Google OAuth provider enabled when GOOGLE_ID and GOOGLE_SECRET are set */
  get googleProvider() {
    return !!(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET);
  },
  
  /** Discord OAuth provider enabled when DISCORD_ID and DISCORD_SECRET are set */
  get discordProvider() {
    return !!(process.env.DISCORD_ID && process.env.DISCORD_SECRET);
  },
};

export type FeatureName = keyof typeof features;

/**
 * Get authentication strategy
 * Always uses database strategy since DATABASE_URL is required
 */
export function getAuthStrategy(): 'database' {
  return 'database';
}

/**
 * Throws an error if a required feature is not enabled
 * Use this in routes/components that require specific features
 */
export function requireFeature(feature: FeatureName, message?: string): void {
  if (!features[feature]) {
    throw new Error(
      message || `Feature '${feature}' is not enabled. Check environment variables.`
    );
  }
}

/**
 * Get a list of enabled OAuth providers
 */
export function getEnabledProviders(): Array<'github' | 'google' | 'discord'> {
  const providers: Array<'github' | 'google' | 'discord'> = [];
  
  if (features.githubProvider) providers.push('github');
  if (features.googleProvider) providers.push('google');
  if (features.discordProvider) providers.push('discord');  
  return providers;
}
