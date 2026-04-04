FROM node:22-alpine AS base

# Stage 1: Prune the monorepo to only files needed for the web app
FROM base AS pruner
RUN npm install -g turbo
WORKDIR /app
COPY . .
RUN turbo prune @real-spanish-stories/web --docker

# Stage 2: Install dependencies using the pruned subset
FROM base AS installer
RUN npm install -g pnpm@10.29.2
WORKDIR /app
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Stage 3: Build the web app
FROM installer AS builder
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_UMAMI_WEBSITE_ID
ENV VITE_UMAMI_WEBSITE_ID=$VITE_UMAMI_WEBSITE_ID
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=@real-spanish-stories/web

# Stage 4: Production image — Nitro bundles the server, no node_modules needed
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 webuser

COPY --from=builder --chown=webuser:nodejs /app/apps/web/.output ./.output

USER webuser
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
