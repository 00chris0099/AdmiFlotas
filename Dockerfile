# ===== BUILD =====
FROM node:20-alpine AS builder

WORKDIR /app

# Root dependencies (Prisma)
COPY package.json package-lock.json ./
RUN npm ci

# Prisma schema + config
COPY prisma.config.ts ./
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Frontend dependencies
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci

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
