# 1. Base Stage
FROM node:20.19.0-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# 2. Dependencies Stage
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# 3. Build Stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Run unconditionally
# This ensures the files exist so "npm run build" doesn't crash on missing imports.
# Prisma does NOT require a valid DB connection just to generate the client files.
RUN npx prisma generate

RUN npm run build

# 4. Production Runner Stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# COPY PRISMA ARTIFACTS
# Matches your schema.prisma output path: ../app/generated/prisma
COPY --from=builder --chown=nextjs:nodejs /app/app/generated ./app/generated
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

# Start app
CMD ["node", "server.js"]