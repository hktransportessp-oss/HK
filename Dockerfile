# ==============================================================================
# Root Dockerfile for Monorepo Cloud Deployments (Railway, Render, Coolify, Fly.io)
# Targets: NestJS Backend in /backend
# ==============================================================================

# Stage 1: Build Stage
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install system dependencies required for OpenSSL, native compilation and Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency definitions and prisma schema first for caching
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy backend source code and configurations
COPY backend/tsconfig*.json backend/nest-cli.json ./

ARG HK_ADMIN_BUILD=HK-ADMIN-ROUTE-WIZARD-02
RUN echo "Building HK Connect Admin: ${HK_ADMIN_BUILD}"

COPY backend/src ./src/

# Compile NestJS application to /app/dist
RUN npm run build

# ==============================================================================
# Stage 2: Production Runtime Stage
# ==============================================================================
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Install runtime OpenSSL, CA certificates and curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000

# Copy package definitions and prisma schema
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev

# Generate Prisma Client in production environment
RUN npx prisma generate

# Copy compiled build output from builder stage
COPY --from=builder /app/dist ./dist

# Healthcheck probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health/live || exit 1

# Expose API port
EXPOSE 3000

# Start production server
CMD ["npm", "run", "start:prod"]
