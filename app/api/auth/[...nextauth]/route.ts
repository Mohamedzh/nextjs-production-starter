/**
 * NextAuth API Route Handler
 * Conditionally exports auth handlers or 404 based on NEXTAUTH_SECRET presence
 * This prevents build failures when auth is not configured
 */

import { NextResponse } from 'next/server';
import { features } from '@/lib/features';

// If auth is not enabled, return 404 for all auth routes
const notConfigured = () => {
  return NextResponse.json(
    { error: 'Authentication not configured' },
    { status: 404 }
  );
};

// Export handlers based on feature flag
let GET, POST;

if (!features.auth) {
  GET = notConfigured;
  POST = notConfigured;
} else {
  // Auth is enabled, import real handlers
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const handler = require('@/lib/auth/config').default;
  GET = handler;
  POST = handler;
}

export { GET, POST };
