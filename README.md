# ⚡ Next.js Production Starter

A production-ready Next.js 16 starter template optimized for Railway deployment with **required PostgreSQL**, **optional Redis**, and **optional authentication**.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/nextjs-production-starter-suite?referralCode=D9T1uj&utm_medium=integration&utm_source=template&utm_campaign=nextjs-production-starter-suite)

## ✨ Features

### Always Required
- 🗄️ **PostgreSQL + Prisma 7** - Type-safe ORM with adapter pattern (REQUIRED)

### Recommended for Production
- ⚡ **Redis** - Persistent ISR caching across deploys (optional, falls back to filesystem)

### Core Stack
- ⚡ **Next.js 16** - App Router, Server Components, Turbopack
- 🎨 **Tailwind CSS v4** - Modern styling with CSS variables
- 🚂 **Railway Optimized** - Railpack auto-detection and build
- 🔒 **Production Security** - CSP, HSTS, XSS protection headers
- 📝 **Structured Logging** - Pino with JSON output (redacted sensitive data)

### Optional Features (Auto-Enabled)
- 🔐 **NextAuth.js v4** - Authentication (database strategy)
- 🔑 **OAuth Providers** - GitHub, Google, Discord (independent)
- 🎯 **Health Checks** - Railway monitoring endpoint
- ⏰ **Cron Jobs** - Scheduled tasks with Railway

## 📦 Prerequisites

- **Node.js** 20.19.0 (LTS)
- **npm** >= 10.0.0
- **PostgreSQL** database (required)
- **Redis** instance (optional - recommended for production)
- **Docker Compose** (for local PostgreSQL/Redis only)

## �🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/nextjs-production-starter.git
cd nextjs-production-starter

# Install dependencies
npm install

# Start PostgreSQL and Redis (Docker)
docker-compose up -d

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the feature dashboard.

## 🎛️ Feature Configuration

**Required Environment Variables:**

| Feature | Environment Variable | Status |
|---------|---------------------|--------|
| **PostgreSQL** | `DATABASE_URL` | ✅ REQUIRED |

**Recommended for Production:**

| Feature | Environment Variable | Status |
|---------|---------------------|--------|
| **Redis Cache** | `REDIS_URL` | ⚠️ OPTIONAL |

**Optional Features (Auto-Enabled):**

| Feature | Environment Variables | Status |
|---------|---------------------|--------|
| **Authentication** | `NEXTAUTH_SECRET` | ❌ Optional |
| GitHub OAuth | `GITHUB_ID` + `GITHUB_SECRET` | ❌ Optional |
| Google OAuth | `GOOGLE_ID` + `GOOGLE_SECRET` | ❌ Optional |
| Discord OAuth | `DISCORD_ID` + `DISCORD_SECRET` | ❌ Optional |

**Always Enabled:** Railpack Build, Structured Logging, Security Headers, Turbopack Dev

## Authentication

Enable authentication by setting `NEXTAUTH_SECRET` (minimum 32 characters):

```bash
npx auth secret
# or
openssl rand -base64 64
```

Add to your `.env`:
```env
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000  # Auto-detected on Railway
```

### OAuth Providers

Configure social login by adding provider credentials:

**GitHub OAuth**
1. Create OAuth App at https://github.com/settings/developers
2. Set callback URL: `{NEXTAUTH_URL}/api/auth/callback/github`
3. Add credentials:
```env
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

**Google OAuth**
1. Create OAuth credentials at https://console.cloud.google.com/apis/credentials
2. Set callback URL: `{NEXTAUTH_URL}/api/auth/callback/google`
3. Add credentials:
```env
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret
```

**Discord OAuth**
1. Create application at https://discord.com/developers/applications
2. Set callback URL: `{NEXTAUTH_URL}/api/auth/callback/discord`
3. Add credentials:
```env
DISCORD_ID=your_discord_client_id
DISCORD_SECRET=your_discord_client_secret
```

## PostgreSQL Database

Configure PostgreSQL with Prisma by setting `DATABASE_URL`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

Run migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

## Redis Cache (Optional)

Enable persistent ISR caching for production:

```env
REDIS_URL=redis://localhost:6379
```

**Benefits:**
- Keeps ISR cache alive across deployments on Railway
- Improves performance with persistent caching
- Falls back to filesystem cache if not configured

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

See `.env.example` for detailed configuration options.

## 📁 Project Structure

```
├── app/                      # Next.js App Router
│   ├── (auth)/signin/       # Authentication pages
│   ├── api/                 # API routes
│   └── page.tsx             # Feature dashboard
├── components/              # React components
├── lib/                     # Utilities
│   ├── features.ts         # Feature detection
│   ├── env.ts              # Environment validation
│   ├── logger.ts           # Structured logging
│   ├── db.ts               # Database client
│   └── auth/               # Auth configuration
├── prisma/                  # Database schema
├── railway.json             # Railway deployment config
├── Dockerfile               # Multi-stage production build
├── cache-handler.mjs        # Redis ISR cache handler
└── docker-compose.yml       # Local PostgreSQL/Redis
```

## 🚂 Railway Deployment

### Quick Deploy

Click **Deploy on Railway** button above to get started.

### Manual Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Add PostgreSQL service (REQUIRED)
railway add --database postgres

# Add Redis service (OPTIONAL - recommended for production)
railway add --database redis

# Deploy
railway up
```

### Build Configuration

Railway uses **Railpack** to automatically build your Next.js app:

- ✅ Generates Prisma Client with dummy URL during build
- ✅ Uses real DATABASE_URL and REDIS_URL at runtime
- ✅ Optimized for Next.js 16 standalone mode
- ✅ Uses Node.js 20.x LTS

### Environment Variables

**Required:**
1. `DATABASE_URL` - Auto-injected when you add PostgreSQL service

**Optional (for authentication):**
2. `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 64`
3. `NEXTAUTH_URL` - Auto-detected from Railway domain
4. OAuth credentials: `GITHUB_ID/SECRET`, `GOOGLE_ID/SECRET`, `DISCORD_ID/SECRET`

**Optional (for production caching):**
5. `REDIS_URL` - Auto-injected when you add Redis service (falls back to filesystem)

### Deployment Workflow

1. **Connect Repository** - Import your GitHub repo in Railway dashboard
2. **Add Services** - Click "+ New" to add PostgreSQL (REQUIRED) and optionally Redis
   - Railway auto-injects `DATABASE_URL` when PostgreSQL is added
   - Railway auto-injects `REDIS_URL` when Redis is added (optional, recommended)
3. **Add Auth (Optional)** - Set `NEXTAUTH_SECRET` and OAuth credentials if needed
4. **Deploy** - Railway automatically builds and deploys

## 📚 Documentation

- [Features Guide](docs/FEATURES.md)
- [Database Setup](docs/DATABASE.md)
- [Security Guide](docs/SECURITY.md)
- [Migration Guide](docs/MIGRATIONS.md)

## 📝 License

MIT License - see LICENSE file for details.

---

**Built for developers who want production-ready templates that actually work.**
