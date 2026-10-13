# =============================================================================
# Frontend - Dockerfile
# Port: 3000
# Role: Next.js 16 frontend application
# =============================================================================

# Multi-stage build for Next.js frontend
# Use Node 22 LTS for latest features and long-term support
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files only
COPY package*.json ./
# Install all dependencies for build time (PostCSS/autoprefixer)
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . ./

# Build-time public configuration. Values are supplied per environment via
# `podman build --build-arg` (never baked in — see .cline/rules/env-policy.md);
# Next.js inlines these into the client bundle at build.
ARG NEXT_PUBLIC_AUTH0_DOMAIN
ARG NEXT_PUBLIC_AUTH0_CLIENT_ID
ARG NEXT_PUBLIC_AUTH0_AUDIENCE
ARG NEXT_PUBLIC_AUTH_URL
ARG NEXT_PUBLIC_DOC_DATA_CON_URL
ARG NEXT_PUBLIC_REPO_DATA_CON_URL
ARG NEXT_PUBLIC_LOG_DATA_CON_URL
ARG NEXT_PUBLIC_LOG_UNI_PROC_URL
ARG NEXT_PUBLIC_CLIENT_CONNECTOR_URL
ARG NEXT_PUBLIC_FEATURE_TOGGLE_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_AUTH0_LOGOUT_REDIRECT_URI
ARG NEXT_PUBLIC_API_TIMEOUT
ARG NEXT_PUBLIC_API_RETRIES
ARG NEXT_PUBLIC_API_RETRY_DELAY
ARG NEXT_PUBLIC_LOG_LEVEL

# Build the frontend
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache dumb-init curl
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application with strict ownership
COPY --chown=nextjs:nodejs --from=builder /app/.next/standalone ./
COPY --chown=nextjs:nodejs --from=builder /app/.next/static ./.next/static
COPY --chown=nextjs:nodejs --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

# PORT/HOSTNAME are supplied at runtime via .map.env / .secret.env
# (see .cline/rules/env-policy.md)

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT}/ || exit 1

# Use dumb-init as PID 1 for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "server.js"]
