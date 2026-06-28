# ===== BUILD =====
FROM node:20-alpine AS builder

WORKDIR /app

# Prisma schema + config (needed BEFORE npm ci for postinstall)
COPY prisma.config.ts ./
COPY prisma/ ./prisma/

# Root dependencies — skip postinstall (ERD generator needs Chrome which we don't have)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Generate only Prisma client (skip ERD generator - no Chrome in Docker)
RUN npx prisma generate --generator client

# Frontend dependencies
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm install

# Frontend source
COPY frontend/ ./frontend/

# Build Next.js
RUN cd frontend && npm run build

# ===== PRODUCTION =====
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy Prisma schema + config BEFORE npm install (postinstall needs them)
COPY prisma.config.ts ./
COPY prisma/ ./prisma/

# Install production deps (--ignore-scripts skips prisma generate, already done in builder)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Generated Prisma client (already built in builder stage)
COPY --from=builder /app/generated ./generated/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma/

# Frontend production files
COPY --from=builder /app/frontend/.next ./.next/
COPY --from=builder /app/frontend/public ./public/
COPY --from=builder /app/frontend/package.json ./
COPY --from=builder /app/frontend/next.config.ts ./

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
