/**
 * NextAuth.js Configuration
 * Hybrid JWT/Database strategy with optional OAuth providers
 * Auto-upgrades to database strategy when DATABASE_URL is present
 */

import NextAuth, { type NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import DiscordProvider from 'next-auth/providers/discord';
import { db } from '@/lib/db';
import { features } from '@/lib/features';
import { env } from '@/lib/env';
import logger from '@/lib/logger';

// Build providers array based on available credentials
const providers: NextAuthOptions['providers'] = [];

if (features.githubProvider) {
  providers.push(
    GithubProvider({
      clientId: env.GITHUB_ID!,
      clientSecret: env.GITHUB_SECRET!,
    })
  );
  logger.debug('GitHub OAuth provider enabled');
}

if (features.googleProvider) {
  providers.push(
    GoogleProvider({
      clientId: env.GOOGLE_ID!,
      clientSecret: env.GOOGLE_SECRET!,
    })
  );
  logger.debug('Google OAuth provider enabled');
}

if (features.discordProvider) {
  providers.push(
    DiscordProvider({
      clientId: env.DISCORD_ID!,
      clientSecret: env.DISCORD_SECRET!,
    })
  );
  logger.debug('Discord OAuth provider enabled');
}

// Warn if auth is enabled but no providers configured
if (features.auth && providers.length === 0) {
  logger.warn('⚠️  Authentication enabled but no OAuth providers configured');
  logger.warn('   Set GITHUB_ID/SECRET, GOOGLE_ID/SECRET, or DISCORD_ID/SECRET to enable social login');
}

export const authConfig: NextAuthOptions = {
  // Always use Prisma adapter since DATABASE_URL is required
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: features.auth ? PrismaAdapter(db) as any : undefined,
  
  // Always use database session strategy
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // OAuth and authentication providers
  providers,

  // Callbacks for session and JWT handling
  callbacks: {
    async session({ session, token, user }) {
      // Add user ID to session
      if (session.user) {
        if (token?.sub) {
          session.user.id = token.sub;
        } else if (user) {
          session.user.id = user.id;
        }
      }
      return session;
    },
    
    async jwt({ token, user }) {
      // Add user ID to JWT token
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },

  // Custom pages
  pages: {
    signIn: '/signin',
    error: '/signin',
  },

  // Debugging in development
  debug: env.NODE_ENV === 'development',

  // Logging
  logger: {
    error(code, ...message) {
      logger.error({ code, message }, 'NextAuth error');
    },
    warn(code, ...message) {
      logger.warn({ code, message }, 'NextAuth warning');
    },
    debug(code, ...message) {
      logger.debug({ code, message }, 'NextAuth debug');
    },
  },
};

// Export NextAuth instance
export default NextAuth(authConfig);
