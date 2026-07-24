# ── TerraCollect API — Production Dockerfile ──
# Multi-stage build for minimal production image.

# ── Stage 1: Install dependencies ──
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy workspace configs (required for pnpm workspaces)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy shared configs
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config

# Copy shared packages (API dependencies)
COPY packages/shared ./packages/shared

# Copy API app
COPY apps/api ./apps/api

# Install production dependencies only (smaller image)
RUN corepack enable && \
  pnpm install --frozen-lockfile --filter @terracollect/api... --prod

# ── Stage 2: Build ──
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copy workspace configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy shared configs
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config

# Copy all packages
COPY packages ./packages

# Copy API app
COPY apps/api ./apps/api

# Install all dependencies (including devDependencies for build)
RUN corepack enable && pnpm install --frozen-lockfile

# Build shared packages first, then API
RUN corepack enable && \
  pnpm --filter @terracollect/shared build && \
  pnpm --filter @terracollect/api build

# ── Stage 3: Production image ──
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nestjs

# Copy built artifacts and production dependencies
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

USER nestjs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "dist/main"]
