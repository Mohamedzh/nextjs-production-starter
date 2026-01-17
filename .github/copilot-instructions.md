# GitHub Copilot Instructions
# Next.js Production Starter

## Quick Reference

This is a Next.js 16.1.1 template with **optional features** that auto-enable based on environment variables.
- **Stack:** Next.js 16, NextAuth v4, Prisma 7, Redis, Tailwind v4
- **Build:** Railway with Nixpacks (no Dockerfile)
- **Philosophy:** All features are optional - builds never break (0/6 features = still works)

## Core Patterns

### 1. Feature Detection (ALWAYS CHECK FIRST)
```typescript
import { features } from '@/lib/features';

// Check before using any optional feature
if (features.auth) { /* use NextAuth */ }
if (features.database) { /* use Prisma */ }
if (features.redis) { /* use Redis */ }
```

### 2. Database Access (May be null)
```typescript
import { getDb } from '@/lib/db';

const db = getDb(); // Returns null if DATABASE_URL not set
if (!db) return Response.json({ error: 'DB not configured' }, { status: 503 });

const users = await db.user.findMany();
```

### 3. Environment Variables (Type-safe)
```typescript
import { env } from '@/lib/env';

const secret = env.NEXTAUTH_SECRET; // Validated with Zod, may be undefined
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
- Check `features.*` before using optional services
- Wrap logic in try/catch with error logging
- Return proper HTTP status codes

### When Using Authentication:
- Check `features.auth` before importing NextAuth
- Use `auth()` from `@/lib/auth` for server-side (wraps getServerSession)
- Use `useSession()` from `next-auth/react` for client-side
- Check `features.githubProvider`/`features.googleProvider`/`features.discordProvider` for OAuth
- **SessionProvider:** Only render when `features.auth` is true (conditional in layout)

### When Using Database:
- Always use `getDb()`, never import `db` directly
- Check if return value is null before querying
- Use Prisma's generated types
- Handle connection errors gracefully

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
import { getDb } from '@/lib/db';
import { features } from '@/lib/features';

export async function getData() {
  if (!features.database) return null;
  
  const db = getDb();
  if (!db) return null;
  
  return await db.yourModel.findMany();
}
```

## Anti-Patterns (Avoid)

- ❌ `console.log()` → ✅ `logger.info()`
- ❌ `process.env.VAR` → ✅ `env.VAR`
- ❌ Assuming features enabled → ✅ Check `features.*`
- ❌ Direct `import { db }` → ✅ `getDb()`

## Key Files

- `lib/features.ts` - Feature detection
- `lib/env.ts` - Environment validation
- `lib/logger.ts` - Structured logging
- `lib/db.ts` - Conditional database client
- `lib/auth/config.ts` - NextAuth configuration

## Testing

Always test code with these configs:
1. **No env vars** (minimal setup) - Should build and run successfully
2. **Auth only** (`NEXTAUTH_SECRET`) - Auth works, no OAuth
3. **Database only** (`DATABASE_URL`) - Prisma works
4. **Full stack** (all env vars) - All 6 features enabled

**Builds must succeed in ALL scenarios.** The Prisma warning is expected without DATABASE_URL.

## Tech Stack Details

- **Next.js:** 16.1.1 with Turbopack
- **NextAuth:** v4.24.13 (v5 incompatible with Next.js 16)
- **Prisma:** 7.2.0 with adapter pattern (@prisma/adapter-pg)
- **Node.js:** 20.19.0 LTS (fixed across all configs)
- **Build:** Nixpacks on Railway (nixpacks.toml config)
- **OAuth:** GitHub, Google, Discord (3 independent providers)
