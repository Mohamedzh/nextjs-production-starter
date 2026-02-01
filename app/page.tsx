/**
 * Feature Discovery Dashboard
 * Shows real-time status of all optional features
 */

import { features, getAuthStrategy } from '@/lib/features';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';

interface FeatureCardProps {
  title: string;
  description: string;
  status: 'enabled' | 'disabled' | 'partial';
  details?: string[];
  setupLink?: string;
}

function FeatureCard({ title, description, status, details, setupLink }: FeatureCardProps) {
  const statusColors = {
    enabled: 'bg-green-50 border-green-200 text-green-800',
    partial: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    disabled: 'bg-gray-50 border-gray-200 text-gray-600',
  };

  const statusIcons = {
    enabled: '✅',
    partial: '⚠️',
    disabled: '⭕',
  };

  return (
    <div className={`rounded-xl border-2 p-6 transition-all hover:shadow-lg ${statusColors[status]}`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="text-2xl">{statusIcons[status]}</span>
          {title}
        </h3>
        <span className="text-xs font-semibold uppercase px-2 py-1 rounded-full bg-white/50">
          {status}
        </span>
      </div>
      
      <p className="text-sm mb-3 opacity-90">{description}</p>
      
      {details && details.length > 0 && (
        <ul className="text-xs space-y-1 mb-3">
          {details.map((detail, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="opacity-50">•</span>
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      )}
      
      {setupLink && status === 'disabled' && (
        <Link
          href={setupLink}
          className="inline-block text-xs font-medium underline opacity-75 hover:opacity-100"
        >
          Setup Instructions →
        </Link>
      )}
    </div>
  );
}

export default async function Home() {
  // Check session if auth is enabled
  const session = features.auth ? await auth() : null;
  
  // Test database connection (always available)
  let dbConnected = false;
  try {
    await db.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  // Count optional features (only auth and OAuth providers)
  const optionalFeatures = ['auth', 'githubProvider', 'googleProvider', 'discordProvider'] as const;
  const enabledOptionalCount = optionalFeatures.filter(f => features[f]).length;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">⚡ Next.js Production Starter</h1>
            <p className="text-sm text-gray-600">Railway Template with Auto-Enabled Features</p>
          </div>
          
          <div className="flex items-center gap-4">
            {features.auth && session?.user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {session.user.name || session.user.email}
                </span>
                <Link
                  href="/api/auth/signout"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </Link>
              </div>
            ) : features.auth ? (
              <Link
                href="/signin"
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Sign In
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Production Starter
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This template auto-enables features based on environment variables.
            Check the status of each feature below.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Authentication */}
          <FeatureCard
            title="Authentication"
            description="NextAuth.js with OAuth providers"
            status={features.auth ? 'enabled' : 'disabled'}
            details={
              features.auth
                ? [
                    `Strategy: ${getAuthStrategy().toUpperCase()}`,
                    session ? `User: ${session.user?.email}` : 'Not signed in',
                    'Configure OAuth providers below',
                  ]
                : [
                    'Set NEXTAUTH_SECRET to enable',
                    'Must be at least 32 characters',
                  ]
            }
            setupLink="https://github.com/Mohamedzh/nextjs-production-starter#authentication"
          />

          {/* GitHub OAuth Provider */}
          <FeatureCard
            title="GitHub Provider"
            description="OAuth login with GitHub"
            status={features.githubProvider ? 'enabled' : 'disabled'}
            details={
              features.githubProvider
                ? [
                    'Status: Configured',
                    'Callback: /api/auth/callback/github',
                  ]
                : [
                    'Set GITHUB_ID to enable',
                    'Set GITHUB_SECRET to enable',
                  ]
            }
            setupLink="https://github.com/Mohamedzh/nextjs-production-starter#oauth-providers"
          />

          {/* Google OAuth Provider */}
          <FeatureCard
            title="Google Provider"
            description="OAuth login with Google"
            status={features.googleProvider ? 'enabled' : 'disabled'}
            details={
              features.googleProvider
                ? [
                    'Status: Configured',
                    'Callback: /api/auth/callback/google',
                  ]
                : [
                    'Set GOOGLE_ID to enable',
                    'Set GOOGLE_SECRET to enable',
                  ]
            }
            setupLink="https://github.com/Mohamedzh/nextjs-production-starter#oauth-providers"
          />

          {/* Discord OAuth Provider */}
          <FeatureCard
            title="Discord Provider"
            description="OAuth login with Discord"
            status={features.discordProvider ? 'enabled' : 'disabled'}
            details={
              features.discordProvider
                ? [
                    'Status: Configured',
                    'Callback: /api/auth/callback/discord',
                  ]
                : [
                    'Set DISCORD_ID to enable',
                    'Set DISCORD_SECRET to enable',
                  ]
            }
            setupLink="https://github.com/Mohamedzh/nextjs-production-starter#oauth-providers"
          />

          {/* Database */}
          <FeatureCard
            title="Database"
            description="PostgreSQL with Prisma ORM"
            status={dbConnected ? 'enabled' : 'partial'}
            details={[
              `Connection: ${dbConnected ? 'Active' : 'Error'}`,
              'Prisma Client: Generated',
              'Migrations: Run db:migrate',
            ]}
            setupLink="https://github.com/Mohamedzh/nextjs-production-starter#postgresql-database"
          />

          {/* Redis */}
          <FeatureCard
            title="Redis Cache"
            description="Persistent ISR caching"
            status={process.env.REDIS_URL ? 'enabled' : 'disabled'}
            details={
              process.env.REDIS_URL
                ? [
                    'ISR cache: Persistent',
                    'Connection: Configured',
                    'Survives deploys: Yes',
                  ]
                : [
                    'Fallback: Filesystem cache',
                    'Set REDIS_URL to enable',
                    'Recommended for production',
                  ]
            }
            setupLink="https://github.com/Mohamedzh/nextjs-production-starter#redis-cache-optional"
          />
        </div>

        {/* Always-Enabled Features Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Always-Enabled Features</h3>
          <p className="text-sm text-gray-600 mb-4">These features work out-of-the-box without configuration</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Nixpacks */}
          <FeatureCard
            title="Nixpacks Build"
            description="Railway-optimized deployment"
            status="enabled"
            details={[
              'Builder: Nixpacks',
              'Node: 20.19.0 LTS',
              'Auto Prisma: Conditional',
            ]}
          />

          {/* Logging */}
          <FeatureCard
            title="Structured Logging"
            description="Pino with JSON output"
            status="enabled"
            details={[
              'Format: JSON (production)',
              'Pretty: Development only',
              'Sensitive data: Redacted',
            ]}
          />

          {/* Security */}
          <FeatureCard
            title="Security Headers"
            description="CSP, HSTS, and more"
            status="enabled"
            details={[
              'CSP: Permissive (OAuth-ready)',
              'HSTS: max-age=1 year',
              'X-Frame-Options: DENY',
            ]}
          />
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="/api/health"
              target="_blank"
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow transition-all"
            >
              <div className="font-semibold text-gray-900 mb-1">Health Check</div>
              <div className="text-sm text-gray-600">View system status</div>
            </a>
            
            <a
              href="https://github.com/Mohamedzh/nextjs-production-starter"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow transition-all"
            >
              <div className="font-semibold text-gray-900 mb-1">GitHub Repository</div>
              <div className="text-sm text-gray-600">Source code & docs</div>
            </a>
            
            <a
              href="https://railway.app/template/nextjs-production-starter"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border border-blue-200 bg-blue-50 rounded-lg hover:border-blue-300 hover:shadow transition-all"
            >
              <div className="font-semibold text-blue-900 mb-1">Deploy to Railway</div>
              <div className="text-sm text-blue-700">One-click deployment</div>
            </a>
          </div>
        </div>

        {/* Environment Status */}
        <div className="mt-8 p-6 bg-gray-900 text-white rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-75 mb-1">Environment</div>
              <div className="text-lg font-mono font-bold">
                {process.env.NODE_ENV?.toUpperCase() || 'UNKNOWN'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-75 mb-1">Features Enabled</div>
              <div className="text-lg font-mono font-bold">
                {enabledOptionalCount} / {optionalFeatures.length}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p className="mb-2">
            Built with Next.js 16 + Prisma + NextAuth + Redis + Pino • Optimized for Railway
          </p>
          <p className="text-xs opacity-75">
            Open source template by{' '}
            <a 
              href="https://github.com/Mohamedzh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-gray-900"
            >
              @Mohamedzh
            </a>
            {' '}• Licensed under MIT
          </p>
        </div>
      </footer>
    </div>
  );
}

export const dynamic = 'force-dynamic';