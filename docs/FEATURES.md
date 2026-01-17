# Features Guide

## Prerequisites

- Node.js 20.19.0 (LTS)
- npm >= 10.0.0
- PostgreSQL 16+ (optional, for database features)
- Redis 7+ (optional, for caching)

## Overview

This template uses an **auto-enable** system where features activate based on environment variable presence. This ensures:
- ✅ Builds never break
- ✅ No manual feature toggling
- ✅ Zero configuration defaults
- ✅ Production flexibility

## Feature Detection

All features are detected in `lib/features.ts`:

```typescript
export const features = {
  auth: !!process.env.NEXTAUTH_SECRET,
  database: !!process.env.DATABASE_URL,
  redis: !!process.env.REDIS_URL,
  githubProvider: !!(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
  googleProvider: !!(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET),
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

- **JWT (Default)**: No database required
- **Database**: Auto-upgrades when `DATABASE_URL` is set

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

## Database (Prisma)

### Enable

Set `DATABASE_URL`:
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
import { getDb } from '@/lib/db';
import { features } from '@/lib/features';

if (!features.database) {
  return { error: 'Database not configured' };
}

const db = getDb();
if (!db) {
  return { error: 'Database unavailable' };
}

const users = await db.user.findMany();
```

## Redis Cache

### Enable

Set `REDIS_URL`:
```bash
REDIS_URL=redis://localhost:6379
```

### Behavior

- **Enabled**: Persistent ISR cache across deployments
- **Disabled**: Falls back to filesystem cache

### Railway Setup

1. Add Redis service in Railway dashboard
2. `REDIS_URL` is automatically set
3. Cache survives container restarts

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

### Docker Integration

Dockerfile includes HEALTHCHECK:
```dockerfile
HEALTHCHECK --interval=30s CMD curl -f http://localhost:3000/api/health || exit 1
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

if (features.auth) {
  // Use authentication
}

if (features.database) {
  // Use database
}
```

## Testing

Test with different configurations:

1. **Minimal**: No env vars
2. **Auth**: Only `NEXTAUTH_SECRET`
3. **Database**: Only `DATABASE_URL`
4. **Full**: All env vars

Build must succeed in all scenarios.
