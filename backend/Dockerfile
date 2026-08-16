# ==============================================================================
# Stage 1: Build Stage
# ==============================================================================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install system dependencies required for OpenSSL, native compilation and Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency definitions and prisma schema first for caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy application source code and configurations
COPY tsconfig*.json nest-cli.json ./
COPY src ./src/

# Compile NestJS application to /app/dist
RUN npm run build

# ==============================================================================
# Stage 2: Production Runtime Stage
# ==============================================================================
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Install runtime OpenSSL and CA certificates for Prisma and PostgreSQL TLS
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000

# Copy package definitions and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev

# Generate Prisma Client in production environment
RUN npx prisma generate

# Copy compiled build output from builder stage
COPY --from=builder /app/dist ./dist

# Expose NestJS API port
EXPOSE 3000

# Start production server
CMD ["npm", "run", "start:prod"]
