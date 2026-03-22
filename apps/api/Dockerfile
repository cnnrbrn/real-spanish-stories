FROM node:22-alpine AS base

# Stage 1: Prune the monorepo to only files needed for the API
FROM base AS pruner
RUN npm install -g turbo
WORKDIR /app
COPY . .
RUN turbo prune @real-spanish-stories/api --docker

# Stage 2: Install dependencies using the pruned subset
FROM base AS installer
RUN npm install -g pnpm@10.29.2
WORKDIR /app
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Stage 3: Build the API
FROM installer AS builder
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=@real-spanish-stories/api

# Stage 4: Production image
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# pnpm node_modules (includes symlinks to workspace packages)
COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules

# shared package compiled output (symlink target for @real-spanish-stories/shared)
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared/package.json ./packages/shared/package.json

# compiled API
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist

USER nestjs
EXPOSE 3001
CMD ["node", "dist/main"]
