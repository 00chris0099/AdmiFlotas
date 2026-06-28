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

# Prisma runtime needs these at runtime
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Generated Prisma client (needed at runtime by frontend)
COPY --from=builder /app/generated ./generated/

# Frontend production files
COPY --from=builder /app/frontend/.next ./.next/
COPY --from=builder /app/frontend/public ./public/
COPY --from=builder /app/frontend/package.json ./
COPY --from=builder /app/frontend/next.config.ts ./

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
