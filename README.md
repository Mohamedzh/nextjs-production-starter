# ⚡ Next.js Production Starter

A feature-packed, production-ready Next.js 16 starter template optimized for Railway deployment. **All features auto-enable based on environment variables** - builds never break.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

## ✨ Features

### Core Stack
- ⚡ **Next.js 16** - App Router, Server Components, TypeScript
- 🎨 **Tailwind CSS v4** - Modern styling with CSS variables
- 🚂 **Railway Optimized** - Nixpacks auto-build (no Dockerfile needed)
- 🔒 **Production Security** - CSP, HSTS, XSS protection headers
- 📝 **Structured Logging** - Pino with JSON output (redacted sensitive data)

### Optional Features (Auto-Enabled)
- 🔐 **NextAuth.js v4** - Authentication with JWT/Database strategy
- 🔑 **OAuth Providers** - GitHub, Google, Discord (independent add-ons)
- 🗄️ **Prisma 7** - PostgreSQL ORM with adapter pattern
- ⚡ **Redis** - Persistent ISR caching (survives deploys)
- 🎯 **Health Checks** - Railway monitoring endpoint
- ⏰ **Cron Jobs** - Scheduled tasks with Railway

## � Prerequisites

- **Node.js** 20.19.0 (LTS)
- **npm** >= 10.0.0
- **Docker** (optional, for local PostgreSQL/Redis)

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

All features are **optional** and auto-enable when environment variables are set:

| Feature | Required Env Vars | Auto-Enabled |
|---------|------------------|--------------|
| **Authentication** | `NEXTAUTH_SECRET` | ✅ |
| GitHub Provider | `GITHUB_ID` + `GITHUB_SECRET` | ✅ |
| Google Provider | `GOOGLE_ID` + `GOOGLE_SECRET` | ✅ |
| Discord Provider | `DISCORD_ID` + `DISCORD_SECRET` | ✅ |
| **Database** | `DATABASE_URL` | ✅ |
| **Redis Cache** | `REDIS_URL` | ✅ |

**Always Enabled:** Nixpacks Build, Structured Logging, Security Headers

## 🔐 Authentication

Enable authentication by setting `NEXTAUTH_SECRET`:

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

## 🗄️ Database

Enable PostgreSQL with Prisma by setting `DATABASE_URL`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

Run migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

## ⚡ Redis Cache

Enable persistent ISR caching:

```env
REDIS_URL=redis://localhost:6379
```

Redis keeps your ISR cache alive across deployments on Railway.

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
├── nixpacks.toml           # Railway build config
├── cache-handler.mjs       # Redis ISR cache handler
└── docker-compose.yml      # Local PostgreSQL/Redis
```

## � Railway Deployment

### Quick Deploy

Click **Deploy on Railway** button above or:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Add PostgreSQL service (optional)
railway add --database postgres

# Add Redis service (optional)
railway add --database redis

# Deploy
railway up
```

### Build Configuration

Railway uses **Nixpacks** to automatically detect and build your Next.js app. The `nixpacks.toml` file provides custom configuration:

- ✅ Conditionally generates Prisma Client when `DATABASE_URL` is set
- ✅ Optimizes for Next.js 16 standalone mode
- ✅ Uses Node.js 20.x LTS

**No Dockerfile needed!** Railway handles the build process automatically.

### Environment Variables

Set these in Railway dashboard:

1. **Required for Auth:** `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
2. **Auto-provided:** `DATABASE_URL`, `REDIS_URL` (when services added)
3. **Optional OAuth:** `GITHUB_ID/SECRET`, `GOOGLE_ID/SECRET`, `DISCORD_ID/SECRET`
4. **Optional Cron:** `CRON_SECRET`

See `.env.example` for detailed setup.

## 🚂 Railway Deployment

### Deployment Workflow

1. **Connect Repository** - Import your GitHub repo in Railway dashboard
2. **Initial Deploy** - App deploys successfully with 0/6 features (minimal setup)
3. **Add Services** (optional) - Click "+ New" to add PostgreSQL or Redis
   - Railway auto-injects `DATABASE_URL` and `REDIS_URL`
4. **Add Env Vars** (optional) - Set `NEXTAUTH_SECRET`, OAuth credentials, etc.

**Key Point:** Template deploys successfully at EVERY stage. Add features when needed.

### CLI Deployment

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

**Services are NOT auto-created** - add them manually in Railway dashboard as needed.

## 📚 Documentation

- [Features Guide](docs/FEATURES.md)
- [Database Setup](docs/DATABASE.md)
- [Security Guide](docs/SECURITY.md)
- [Migration Guide](docs/MIGRATIONS.md)

## 📝 License

MIT License - see LICENSE file for details.

---

**Built for developers who want production-ready templates that actually work.**
