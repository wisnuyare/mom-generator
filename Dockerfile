FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies for backend
FROM base AS backend-deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build backend
FROM base AS backend-build
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci && npm cache clean --force
COPY api/ ./api/
RUN npx tsc

# Build frontend
FROM base AS frontend-build
COPY web/package*.json ./web/
WORKDIR /app/web
RUN npm ci && npm cache clean --force
COPY web/ .
RUN npm run build

# Production runtime
FROM node:20-alpine AS runtime
WORKDIR /app

# Copy backend dependencies and built files
COPY --from=backend-deps /app/node_modules ./node_modules
COPY --from=backend-build /app/dist ./dist
COPY package*.json ./

# Copy frontend build
COPY --from=frontend-build /app/web/dist ./web/dist

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs appuser && \
    chown -R appuser:nodejs /app

USER appuser

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "dist/api/server.js"]