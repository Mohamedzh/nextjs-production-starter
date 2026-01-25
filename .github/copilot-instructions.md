# GitHub Copilot Instructions
# Next.js Production Starter

## Quick Reference

This is a Next.js 16.1.1 template with **PostgreSQL and Redis required**, and **optional auth features**.
- **Stack:** Next.js 16 with Turbopack, NextAuth v4, Prisma 7, Redis, Tailwind v4
- **Build:** Railway with Dockerfile (multi-stage)
- **Philosophy:** Database and Redis are always enabled; Auth and OAuth providers are optional

## Core Patterns

### 1. Feature Detection (Check for Optional Features Only)
```typescript
import { features } from '@/lib/features';

// Only auth and OAuth providers are optional
if (features.auth) { /* use NextAuth */ }
if (features.githubProvider) { /* GitHub OAuth available */ }
// Database and Redis are ALWAYS available - no need to check
```

### 2. Database Access (Always Available)
```typescript
import { db } from '@/lib/db';

// db is always initialized - no null checks needed
const users = await db.user.findMany();
```

### 3. Environment Variables (Type-safe)
```typescript
import { env } from '@/lib/env';

// DATABASE_URL and REDIS_URL are REQUIRED (validated with Zod)
const dbUrl = env.DATABASE_URL; // Always exists
const redisUrl = env.REDIS_URL; // Always exists

// Auth vars are optional
const secret = env.NEXTAUTH_SECRET; // May be undefined
```

### 4. Logging (Structured)
```typescript
import logger from '@/lib/logger';

logger.info({ userId, action }, 'User action');
logger.error({ err }, 'Error occurred');
```

## Code Completion Rules

### When Creating API Routes:
- Import `NextRequest`, `NextResponse` from `next/server`
- Import `logger` from `@/lib/logger`
- Import `db` from `@/lib/db` (always available, no null checks)
- Check `features.auth` before using authentication
- Wrap logic in try/catch with error logging
- Return proper HTTP status codes

### When Using Authentication:
- Check `features.auth` before importing NextAuth
- Use `auth()` from `@/lib/auth` for server-side
- Use `useSession()` from `next-auth/react` for client-side
- Check `features.githubProvider`/`features.googleProvider`/`features.discordProvider` for OAuth
- **SessionProvider:** Only render when `features.auth` is true
- **Strategy:** Always uses 'database' (DATABASE_URL is required)

### When Using Database:
- Import `db` from `@/lib/db` (not `getDb()`)
- Database is always initialized - no null checks needed
- Use Prisma's generated types
- Handle connection errors gracefully with try/catch
- Optimized for Turbopack with singleton pattern

### When Adding OAuth Providers:
- Check `features.githubProvider` or `features.googleProvider`
- Conditional rendering based on provider availability
- Add proper callback URLs in OAuth app settings

## Common Snippets

### API Route Template:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Request received');
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Request failed');
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Protected Route Template:
```typescript
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { features } from '@/lib/features';

export default async function ProtectedPage() {
  if (!features.auth) redirect('/?error=auth-disabled');
  
  const session = await auth();
  if (!session?.user) redirect('/signin');
  
  return <div>Protected content</div>;
}
```

### Database Query Template:
```typescript
import { db } from '@/lib/db';

export async function getData() {
  // Database is always available
  return await db.yourModel.findMany();
}
```

## Anti-Patterns (Avoid)

- ❌ `console.log()` → ✅ `logger.info()`
- ❌ `process.env.VAR` → ✅ `env.VAR`
- ❌ Checking `features.database` or `features.redis` → ✅ They're always enabled
- ❌ `getDb()` with null checks → ✅ Import `db` directly

## Key Files

- `lib/features.ts` - Feature detection (auth and OAuth only)
- `lib/env.ts` - Environment validation (DATABASE_URL and REDIS_URL required)
- `lib/logger.ts` - Structured logging
- `lib/db.ts` - Database client (always initialized, singleton for Turbopack)
- `lib/auth/config.ts` - NextAuth configuration (always uses database strategy)

## Testing

Always test code with these configs:
1. **No env vars** (minimal setup) - Should build and run successfully
2. **Auth only** (`NEXTAUTH_SECRET`) - Auth works, no OAuth
3. **Database only** (`DATABASE_URL`) - Prisma works
4. **Full stack** (all env vars) - All 6 features enabled

**BuiMinimal** (DATABASE_URL + REDIS_URL only) - Auth disabled
2. **Auth enabled** (+ NEXTAUTH_SECRET) - Auth works, no OAuth
3. **Full stack** (all env vars) - All features enabled

**DATABASE_URL and REDIS_URL are required for build to succeed.**

## Tech Stack Details

- **Next.js:** 16.1.1 with Turbopack (dev hot-reload handled in db.ts)
- **NextAuth:** v4.24.13 with database strategy (v5 incompatible with Next.js 16)
- **Prisma:** 7.2.0 with adapter pattern (@prisma/adapter-pg) - **always required**
- **Redis:** ioredis client - **always required** for ISR caching
- **Node.js:** 20.19.0 LTS (fixed across all configs)
- **Build:** Dockerfile with multi-stage build
- **OAuth:** GitHub, Google, Discord (3 independent optional