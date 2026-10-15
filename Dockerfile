# ==============================================================================
# Production Dockerfile for Google Cloud Run
# Multi-stage build for Family Health Vault AI
#
# Security & Secret Isolation:
# - No build-time secrets or ARGs are accepted or baked into container layers.
# - GEMINI_API_KEY and other credentials are injected exclusively at runtime
#   via Google Cloud Run Environment Variables or Secret Manager.
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Application & Server Assets
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install build dependencies
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy application source code (excluding secrets via .dockerignore)
COPY . .

# Build Vite SPA frontend and bundle Express server.ts -> server.js
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Hardened Minimal Production Runtime
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Google Cloud Run dynamically assigns PORT (default 8080)
ENV PORT=8080

# Create unprivileged system group & user for container security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install only production dependencies
COPY package*.json ./
RUN (npm ci --omit=dev --legacy-peer-deps || npm install --omit=dev --legacy-peer-deps) \
  && npm cache clean --force

# Copy compiled frontend and bundled server from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json

# Enforce non-root ownership
RUN chown -R appuser:appgroup /app

# Run container as non-root user
USER appuser

# Expose default Cloud Run port
EXPOSE 8080

# Container liveness & readiness health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# Start production server
CMD ["node", "server.js"]
