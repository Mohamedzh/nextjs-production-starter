# Next.js Production Starter - Claude Code Rules

## Project Overview
Railway-optimized Next.js 16.1.1 template with **required PostgreSQL** and **optional Redis/auth**.
- PostgreSQL is required
- Redis is optional (falls back to filesystem cache)
- Auth and OAuth providers are optional
- Optimized for Turbopack hot-reload

## Tech Stack
- **Next.js:** 16.1.1 (App Router, Server Components, Turbopack)
- **TypeScript:** 5.7.2 (strict mode)
- **NextAuth:** v4.24.13 (v5 incompatible with Next.js 16)
- **Prisma:** 7.2.0 with adapter pattern (@prisma/adapter-pg) - REQUIRED
- **Redis:** ioredis 5.9.1 (ISR cache handler) - REQUIRED
- **PostgreSQL:** Required via DATABASE_URL
- **Node.js:** 20.19.0 LTS (fixed in engines, .nvmrc)
- **Build:** Railpack (auto-detection) on Railway
- **Styling:** Tailwind CSS v4

## Core Architecture Principle

**PostgreSQL Required, Redis/Auth Optional**
```typescript
// PostgreSQL is ALWAYS available
import { db } from '@/lib/db';
const users = await db.user.findMany();

// Redis is handled automatically by cache-handler.mjs (no feature check needed)

// Only check for OPTIONAL auth features
import { features } from '@/lib/features';
if (features.auth) { /* use NextAuth */ }
if (features.githubProvider) { /* GitHub OAuth */ }
```

## Critical Patterns

### 1. Database Access (Always Available)
```typescript
import { db } from '@/lib/db';

// Database is always initialized - no null checks needed
const users = await db.user.findMany();

// Handle connection errors gracefully
try {
  const data = await db.model.findMany();
} catch (error) {
  logger.error({ error }, 'Database query failed');
}
```

### 2. Authentication (NextAuth v4)
```typescript
// Server Component
import { auth } from '@/lib/auth';
const session = await auth(); // Uses getServerSession internally

// Client Component
'use client';
import { useSession } from 'next-auth/react';
const { data: session } = useSession();

// Layout (Conditional)
{features.auth ? (
  <SessionProvider>{children}</SessionProvider>
) : children}
```

### 3. Logging (Structured)
```typescript
import logger from '@/lib/logger';

// Good
logger.info({ userId, action }, 'User performed action');
logger.error({ err, context }, 'Operation failed');

// Bad
console.log('Something happened'); // Never use in production
```

### 4. Environment Variables (Type-safe)
```typescript
import { env } from '@/lib/env';

// Good
const secret = env.NEXTAUTH_SECRET; // Zod-validated, may be undefined

// Bad
const secret = process.env.NEXTAUTH_SECRET; // No validation
```

## API Route Template
```typescript
import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Database is always available
    const data = await db.model.findMany();
    
    logger.info({ count: data.length }, 'Data fetched');
    return NextResponse.json({ data });
  } catch (error) {
    logger.error({ error }, 'Request failed');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Protected Route Template
```typescript
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { features } from '@/lib/features';

export default async function ProtectedPage() {
  // Check if auth is enabled
  if (!features.auth) {
    redirect('/?error=auth-disabled');
  }
  
  // Check if user is authenticated
  const session = await auth();
  if (!session?.user) {
    redirect('/signin');
  }
  
  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
    </div>
  );
}
```

## OAuth Provider Pattern
```typescript
// In lib/auth/config.ts
const providers = [];
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(GithubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  }));
}
// Repeat for Google, Discord...

// In components
{features.githubProvider && <GitHubSignInButton />}
{features.googleProvider && <GoogleSignInButton />}
{features.discordProvider && <DiscordSignInButton />}
```

## File Organization

```
lib/
├── features.ts          # Feature detection (CHECK FIRST)
├── env.ts              # Zod environment validation
├── logger.ts           # Pino structured logging
├── db.ts               # Conditional Prisma client (getDb)
└── auth/
    ├── index.ts        # Auth exports (auth, signIn, signOut)
    └── config.ts       # NextAuth v4 configuration

app/
├── layout.tsx          # Conditional SessionProvider
├── page.tsx            # Feature dashboard
└── api/
    ├── auth/[...nextauth]/route.ts  # NextAuth handler
    ├── health/route.ts              # Health check
    └── cron/route.ts                # Scheduled jobs

components/
└── auth/
    ├── session-provider.tsx  # Client wrapper
    └── signin-button.tsx     # OAuth buttons
```

## Environment Variables (6 Optional Features)

1. **Authentication:** `NEXTAUTH_SECRET` (enables base auth)
2. **GitHub Provider:** `GITHUB_ID` + `GITHUB_SECRET`
3. **Google Provider:** `GOOGLE_ID` + `GOOGLE_SECRET`
4. **Discord Provider:** `DISCORD_ID` + `DISCORD_SECRET`
5. **Database:** `DATABASE_URL` (enables Prisma)
6. **Redis Cache:** `REDIS_URL` (enables ISR caching)

**Always enabled:** Nixpacks build, structured logging, security headers

## Railway Deployment Flow

1. **Connect repo** → Railway dashboard
2. **Initial deploy** → Works with 0/6 features (minimal)
3. **Add services** → Click "+ New" for PostgreSQL/Redis
   - Railway auto-injects `DATABASE_URL`, `REDIS_URL`
4. **Add env vars** → Set secrets in Railway dashboard
   - Each env var auto-enables its feature

**Key:** Services are NOT auto-created, add manually as needed.

## Build System (Nixpacks)

Railway uses `nixpacks.toml`:
```toml
[phases.setup]
cmds = ['test -n "$DATABASE_URL" && npx prisma generate || echo "Skipping prisma generate"']

[start]
cmd = 'npm start'
```

- Conditionally runs `prisma generate` only if DATABASE_URL exists
- No build config needed (Railpack auto-detects)
- Node 20.19.0 LTS auto-detected

## Common Warnings (Ignorable)

**Turbopack warning when DATABASE_URL not set:**
```
Module not found: Can't resolve '../app/generated/prisma'
```
- Expected behavior (Prisma client not generated)
- Try/catch in lib/db.ts handles gracefully
- Build still succeeds
- Disappears when DATABASE_URL is set and prisma generate runs

## Anti-Patterns (DO NOT DO)

❌ Assume auth features are available without checking
❌ Use `console.log()` in production (use `logger.*`)
❌ Access `process.env.*` directly (use `env.*`)
❌ Use `getDb()` with null checks (import `db` directly)
❌ Check for `features.database` or `features.redis` (they don't exist)
❌ Use `require()` without dynamic imports in lib/db.ts context
❌ Mount SessionProvider when auth disabled

## Testing Matrix

**Always test these scenarios:**

| Scenario | Env Vars | Expected |
|----------|----------|----------|
| Minimal | `DATABASE_URL` only | ✅ Build succeeds, 0/4 auth features |
| With Redis | + `REDIS_URL` | ✅ Redis cache enabled |
| Auth only | + `NEXTAUTH_SECRET` | ✅ Auth enabled, no OAuth |
| Auth + GitHub | + `GITHUB_ID/SECRET` | ✅ GitHub login works |
| Full stack | All vars | ✅ All features enabled |

## Key Gotchas

1. **NextAuth v5 incompatible** - Must use v4 with Next.js 16
2. **Prisma 7 requires adapters** - Use `@prisma/adapter-pg` with Pool
3. **SessionProvider is client-only** - Wrap in client component
4. **getDb() returns Promise** - Can be made async if needed
5. **Discord provider exists** - Microsoft doesn't (in next-auth v4)

## Remember

**"Flexibility over rigidity"** - This template adapts to available configuration.
- Zero env vars? Works fine.
- All env vars? Works great.
- Mix and match? Still works.

Every feature is optional. Every build succeeds.
