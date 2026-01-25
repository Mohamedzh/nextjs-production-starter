/**
 * Feature Detection
 * Auto-detects enabled features based on environment variable presence
 * Features are enabled when their required environment variables are set
 * 
 * NOTE: Uses getters to evaluate at runtime instead of build time
 * This ensures Railway/Docker env vars are properly detected
 */

export const features = {
  /** Authentication enabled when NEXTAUTH_SECRET is set */
  get auth() {
    return !!process.env.NEXTAUTH_SECRET;
  },
  
  /** Database enabled when DATABASE_URL is set */
  get database() {
    return !!process.env.DATABASE_URL;
  },
  
  /** Redis caching enabled when REDIS_URL is set */
  get redis() {
    return !!process.env.REDIS_URL;
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
 * Get authentication strategy based on available features
 * Uses database strategy when DATABASE_URL is present, otherwise JWT
 */
export function getAuthStrategy(): 'jwt' | 'database' {
  return features.database ? 'database' : 'jwt';
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
