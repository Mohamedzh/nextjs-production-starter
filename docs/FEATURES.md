# Features Guide

## Prerequisites

- Node.js 20.19.0 (LTS)
- npm >= 10.0.0
- PostgreSQL 16+ (REQUIRED)
- Redis 7+ (OPTIONAL - recommended for production)

## Overview

This template uses an **auto-enable** system where features activate based on environment variable presence. This ensures:
- ✅ Builds never break
- ✅ No manual feature toggling
- ✅ Zero configuration defaults
- ✅ Production flexibility

## Feature Detection

Optional features are detected in `lib/features.ts`:

```typescript
export const features = {
  // PostgreSQL is REQUIRED - no feature check needed
  // Redis is OPTIONAL - handled by cache-handler.mjs with automatic fallback
  auth: !!process.env.NEXTAUTH_SECRET,
  githubProvider: !!(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
  googleProvider: !!(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET),
  discordProvider: !!(process.env.DISCORD_ID && process.env.DISCORD_SECRET),
};
```

## Authentication (NextAuth.js)

### Enable

Set `NEXTAUTH_SECRET`:
```bash
npx auth secret
# or
openssl rand -base64 64
```

### Strategy

- **Database (Always)**: Uses database sessions (DATABASE_URL is required)
- No JWT fallback - PostgreSQL is required for this template

### OAuth Providers

**GitHub**
1. Create OAuth App: https://github.com/settings/developers
2. Set callback URL: `{YOUR_URL}/api/auth/callback/github`
3. Add credentials:
   ```bash
   GITHUB_ID=your_app_id
   GITHUB_SECRET=your_app_secret
   ```

**Google**
1. Create OAuth credentials: https://console.cloud.google.com/apis/credentials
2. Set callback URL: `{YOUR_URL}/api/auth/callback/google`
3. Add credentials:
   ```bash
   GOOGLE_ID=your_client_id
   GOOGLE_SECRET=your_client_secret
   ```

### Usage

**Server Component:**
```typescript
import { auth } from '@/lib/auth';

const session = await auth();
if (!session) redirect('/signin');
```

**Client Component:**
```typescript
'use client';
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
```

## PostgreSQL Database (Prisma)

### Enable

Set `DATABASE_URL` (required):
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Setup

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Open Prisma Studio
npm run db:studio
```

### Usage

```typescript
import { db } from '@/lib/db';
import logger from '@/lib/logger';

// Database is always available - no feature checks needed
try {
  const users = await db.user.findMany();
  return { users };
} catch (error) {
  logger.error({ error }, 'Database query failed');
  return { error: 'Database unavailable' };
}
```

## Redis Cache (Optional)

### Enable

Set `REDIS_URL` for production caching:
```bash
REDIS_URL=redis://localhost:6379
```

### Behavior

- **With Redis**: Persistent ISR cache across deployments and container restarts
- **Without Redis**: Automatic fallback to Next.js filesystem cache
- **No breaking changes**: App works fine without Redis

### Railway Setup

1. Add Redis service in Railway dashboard (optional)
2. `REDIS_URL` is automatically injected when service is added
3. Remove service anytime - deployment won't break

## Cron Jobs

### Enable

Set `CRON_SECRET`:
```bash
openssl rand -base64 32
```

### Configure Railway

Add to `railway.json`:
```json
{
  "crons": [{
    "schedule": "0 0 * * *",
    "url": "/api/cron",
    "headers": {
      "Authorization": "Bearer ${CRON_SECRET}"
    }
  }]
}
```

### Usage

Edit `app/api/cron/route.ts` to add your tasks:

```typescript
// Add your cron logic
logger.info('Running scheduled task');
// Your code here
```

## Health Checks

### Endpoint

`GET /api/health`

Returns:
```json
{
  "status": "healthy",
  "features": {
    "auth": { "enabled": true, "strategy": "database" },
    "database": { "enabled": true, "status": "connected" },
    "redis": { "enabled": true, "status": "connected" }
  },
  "memory": { "used": 150, "total": 512 }
}
```

### Railway Deployment

Railpack automatically detects and monitors health checks via `railway.json`:
```json
{
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 10
  }
}
```

## Logging

### Configuration

- **Development**: Pretty-printed, colored output
- **Production**: JSON structured logs

### Usage

```typescript
import logger from '@/lib/logger';

logger.info({ userId, action }, 'User action');
logger.error({ error }, 'Error occurred');
logger.warn({ context }, 'Warning');
```

### Sensitive Data

Automatically redacted:
- Authorization headers
- Cookies
- Database URLs
- Secrets
- Passwords
- Tokens

## Security Headers

### Content Security Policy

Configured in `middleware.ts`:
- **Default**: Permissive for OAuth
- **Customizable**: Edit for your needs

### Headers Applied

- HSTS (max-age: 1 year)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- CSP: See middleware.ts

### Tightening CSP

Edit `proxy.ts`:
```typescript
const cspPolicy = `
  script-src 'self' https://trusted-cdn.com;
  img-src 'self' data: https://cdn.example.com;
`;
```

## Environment Validation

### Type Safety

All env vars validated with Zod in `lib/env.ts`:

```typescript
import { env } from '@/lib/env';

// ✅ Type-safe
const secret = env.NEXTAUTH_SECRET; // string | undefined

// ❌ Avoid
const secret = process.env.NEXTAUTH_SECRET; // Unvalidated
```

### Validation Errors

Invalid env vars throw errors at startup with detailed messages.

## Feature Flags

Check features before use:

```typescript
import { features } from '@/lib/features';

// Only check for optional auth features
if (features.auth) {
  // Use authentication
}

if (features.githubProvider) {
  // Use GitHub OAuth
}

// Database is always available - no feature check needed
import { db } from '@/lib/db';
const users = await db.user.findMany();
```

## Testing

Test with different configurations:

1. **Minimal**: No env vars
2. **Auth**: Only `NEXTAUTH_SECRET`
3. **Database**: Only `DATABASE_URL`
4. **Full**: All env vars

Build must succeed in all scenarios.
