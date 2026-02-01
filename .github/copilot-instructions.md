# GitHub Copilot Instructions
# Next.js Production Starter

## Quick Reference

This is a Next.js 16.1.1 template with **PostgreSQL required**, **Redis optional**, and **optional auth features**.
- **Stack:** Next.js 16 with Turbopack, NextAuth v4, Prisma 7, Redis (optional), Tailwind v4
- **Build:** Railway with Railpack (auto-detection)
- **Philosophy:** PostgreSQL is required; Redis and Auth are optional with automatic fallbacks

## Core Patterns

### 1. Feature Detection (Check for Optional Features Only)
```typescript
import { features } from '@/lib/features';

// Only auth and OAuth providers need feature checks
if (features.auth) { /* use NextAuth */ }
if (features.githubProvider) { /* GitHub OAuth available */ }
// PostgreSQL is ALWAYS available - no need to check
// Redis is handled automatically by cache-handler.mjs with fallback
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

// DATABASE_URL is REQUIRED (validated with Zod)
const dbUrl = env.DATABASE_URL; // Always exists

// REDIS_URL is OPTIONAL (nullish)
const redisUrl = env.REDIS_URL; // May be undefined

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
- ❌ Checking `features.database` or `features.redis` → ✅ They don't exist
- ❌ Using `getDb()` with null checks → ✅ Import `db` directly

## Key Files

- `lib/features.ts` - Feature detection (auth and OAuth only)
- `lib/env.ts` - Environment validation (DATABASE_URL required, REDIS_URL optional)
- `lib/logger.ts` - Structured logging
- `lib/db.ts` - Database client (always initialized, singleton for Turbopack)
- `lib/auth/config.ts` - NextAuth configuration (always uses database strategy)

## Testing

Always test code with these configs:
1. **Minimal** (`DATABASE_URL` only) - Core functionality works
2. **With Redis** (+ `REDIS_URL`) - Persistent caching enabled
3. **With Auth** (+ `NEXTAUTH_SECRET`) - Auth works, no OAuth
4. **Full stack** (all env vars) - All features enabled

**Note:** Only `DATABASE_URL` is required for build to succeed.

## Tech Stack Details

- **Next.js:** 16.1.1 with Turbopack (dev hot-reload handled in db.ts)
- **NextAuth:** v4.24.13 with database strategy (v5 incompatible with Next.js 16)
- **Prisma:** 7.2.0 with adapter pattern (@prisma/adapter-pg) - **required**
- **Redis:** ioredis client - **optional** (ISR caching with filesystem fallback)
- **Node.js:** 20.19.0 LTS (fixed across all configs)
- **Build:** Railpack with automatic Node.js detection
- **OAuth:** GitHub, Google, Discord (3 independent optional