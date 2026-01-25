# AI Coding Assistant Instructions
# Next.js Production Starter Template

## Project Overview

This is a production-grade Next.js 16 starter template optimized for Railway deployment with **required PostgreSQL and Redis**, and **optional authentication features**.

**Core Philosophy:** PostgreSQL and Redis are always required. Authentication and OAuth providers are optional features that auto-enable based on environment variables.

---

## Architecture Decisions

### 1. **Standalone Output Mode**
- Uses Next.js `output: 'standalone'` for Docker optimization
- Reduces image size from ~1GB to ~150MB
- Required for efficient Railway deployments

### 2. **Feature Detection System**
- Located in `lib/features.ts`
- Auto-detects optional features: auth and OAuth providers
- Database and Redis are always available - no feature checks needed

### 3. **Database and Redis Initialization**
- Prisma Client: Always initialized from `db` export in `lib/db.ts`
- Redis Cache: Always available via `cache-handler.mjs`
- Both are required - validated in `lib/env.ts`

### 4. **Authentication Strategy**
- Always uses database sessions (DATABASE_URL is required)
- Check `features.auth` before using NextAuth features
- Auth is optional - app works without it

---

## Key Patterns

### Accessing Optional Features

**✅ CORRECT - Database is always available:**
```typescript
import { db } from '@/lib/db';

export async function GET() {
  // Database is always available - no checks needed
  const data = await db.model.findMany();
  return Response.json({ data });
}
```

**✅ CORRECT - Check for auth feature:**
```typescript
import { features } from '@/lib/features';
import { auth } from '@/lib/auth';

export async function GET() {
  if (!features.auth) {
    return Response.json({ error: 'Auth not configured' }, { status: 503 });
  }
  
  const session = await auth();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return Response.json({ user: session.user });
}
```
  if (!db) {
    return Response.json({ error: 'Database unavailable' }, { status: 503 });
  }
  
  const users = await db.user.findMany();
  return Response.json({ users });
}
```

**❌ WRONG - Assuming feature is available:**
```typescript
import { db } from '@/lib/db'; // May be null!

export async function GET() {
  const users = await db.user.findMany(); // CRASH if db is null
  return Response.json({ users });
}
```

### Environment Variables

**✅ CORRECT - Use validated env:**
```typescript
import { env } from '@/lib/env';

const secret = env.NEXTAUTH_SECRET; // Zod-validated, type-safe
```

**❌ WRONG - Direct process.env access:**
```typescript
const secret = process.env.NEXTAUTH_SECRET; // Unvalidated, string | undefined
```

### Logging

**✅ CORRECT - Structured logging:**
```typescript
import logger from '@/lib/logger';

logger.info({ userId, action: 'login' }, 'User logged in');
logger.error({ err: error, userId }, 'Failed to process request');
```

**❌ WRONG - Console logging:**
```typescript
console.log('User logged in:', userId); // Loses structure in production
console.error(error); // No context
```

### OAuth Providers

**✅ CORRECT - Conditional provider rendering:**
```typescript
import { features } from '@/lib/features';

export function LoginButtons() {
  return (
    <>
      {features.githubProvider && <GitHubButton />}
      {features.googleProvider && <GoogleButton />}
      {!features.githubProvider && !features.googleProvider && (
        <p>No OAuth providers configured</p>
      )}
    </>
  );
}
```

---

## Common Tasks

### Adding a New API Route

1. Create `app/api/[name]/route.ts`
2. Import logger and features
3. Add feature checks if needed
4. Use `NextRequest`/`NextResponse` types
5. Add error handling with try/catch
6. Log requests and errors

**Template:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { features } from '@/lib/features';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Processing request');
    
    // Your logic here
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Request failed');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Adding a Database Model

1. Database is always available - no feature checks needed
2. Edit `prisma/schema.prisma`
3. Run `npx prisma migrate dev --name model_name`
4. Import `db` from `@/lib/db` and use directly
5. Handle connection errors with try/catch

**Template:**
```typescript
import { db } from '@/lib/db';

// Database is always available - no checks needed
const record = await db.yourModel.create({ data });
```

### Enabling a New Feature

1. Add env var check to `lib/features.ts`
2. Add Zod validation to `lib/env.ts`
3. Document in `.env.example`
4. Add conditional logic where feature is used
5. Update health endpoint to report feature status

---

## Anti-Patterns (DO NOT DO)

### ❌ Don't Access `process.env` Directly
Use `env` from `lib/env.ts` for type safety and validation.

### ❌ Don't Assume Features Are Available
Always check `features.auth`, `features.database`, etc. before using them.

### ❌ Don't Use `console.log`
Use the Pino logger from `lib/logger.ts` for structured logs.

### ❌ Don't Hardcode Secrets
All secrets must be in environment variables, never committed to git.

### ❌ Don't Import NextAuth Without Checking
```typescript
// BAD:
import { signIn } from 'next-auth/react';

// GOOD:
import { features } from '@/lib/features';
if (features.auth) {
  const { signIn } = await import('next-auth/react');
}
```

### ❌ Don't Break Builds
Code must work even when optional features are disabled. Test with minimal env vars.

---

## Environment Variables

### Required (None - everything is optional!)

### Optional Features

| Variable | Enables | Default |
|----------|---------|---------|
| `NEXTAUTH_SECRET` | Authentication | Disabled |
| `DATABASE_URL` | Prisma ORM | Disabled |
| `REDIS_URL` | ISR Caching | Filesystem fallback |
| `CRON_SECRET` | Secure cron endpoints | Disabled |
| `GITHUB_ID` + `GITHUB_SECRET` | GitHub OAuth | Disabled |
| `GOOGLE_ID` + `GOOGLE_SECRET` | Google OAuth | Disabled |

---

## File Organization

```
lib/
  ├── features.ts       # Feature detection (CHECK THIS FIRST)
  ├── env.ts            # Env validation (USE THIS NOT process.env)
  ├── logger.ts         # Pino logger (USE THIS NOT console.log)
  ├── db.ts             # Prisma client (MAY RETURN NULL)
  └── auth/
      ├── config.ts     # NextAuth config
      └── index.ts      # Auth exports

app/
  ├── api/
  │   ├── auth/[...nextauth]/  # Returns 404 if auth disabled
  │   ├── health/              # Feature status endpoint
  │   └── cron/                # Bearer token protected
  ├── (auth)/signin/           # Redirects if auth disabled
  └── page.tsx                 # Feature dashboard

components/
  └── auth/                    # Conditional rendering based on features
```

---

## Testing Checklist

When adding new code, test with these environment configurations:

1. **Minimal** - No optional env vars (default Next.js)
2. **Auth Only** - `NEXTAUTH_SECRET` + OAuth provider
3. **Database Only** - `DATABASE_URL`
4. **Full Stack** - All env vars set

Build must succeed in ALL scenarios.

---

## Key Files to Reference

- **Feature Detection:** `lib/features.ts` - Check before using any optional feature
- **Environment:** `lib/env.ts` - Type-safe env access
- **Database:** `lib/db.ts` - Conditional Prisma client
- **Auth:** `lib/auth/config.ts` - Hybrid JWT/database strategy
- **Logging:** `lib/logger.ts` - Structured JSON logs

---

## Remember

1. **Features are optional** - Code must work without them
2. **Check before use** - Use `features.*` flags
3. **Log, don't console** - Use Pino for all logging
4. **Validate env** - Use `env.*` not `process.env.*`
5. **Handle null** - `getDb()` returns null when database disabled

This template prioritizes **developer experience** and **deployment flexibility** over rigid configuration.
