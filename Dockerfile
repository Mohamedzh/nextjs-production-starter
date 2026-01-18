# 1. Base Stage
FROM node:20.19.0-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# 2. Dependencies Stage
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Copy postinstall script (required by npm ci)
COPY scripts ./scripts
RUN npm ci

# 3. Build Stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 1. OPTIONAL: Accept a real DATABASE_URL as a build argument
# If not provided, this variable is simply empty (it does not crash).
ARG DATABASE_URL

# 2. GENERATE PRISMA CLIENT
# We use shell logic to handle the empty case safely.
# syntax: ${VARIABLE:-DEFAULT_VALUE}
RUN export DATABASE_URL=${DATABASE_URL:-"postgresql://dummy:dummy@localhost:5432/dummy"} && \
    echo "Generating Prisma Client with: ${DATABASE_URL}" && \
    npx prisma generate

# 3. BUILD NEXT.JS
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