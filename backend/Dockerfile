FROM node:20-alpine AS builder

WORKDIR /app

# Contexto: raíz del repo
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/
COPY prisma ./prisma/
COPY generated ./generated/

RUN cd backend && npm install

COPY backend/ ./backend/
COPY shared/ ./shared/

WORKDIR /app/backend

ARG DATABASE_URL
ARG JWT_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY shared/ ./shared/
COPY prisma/ ./prisma/
COPY generated/ ./generated/

EXPOSE 3001

ENV PORT=3001

CMD ["node", "dist/server.js"]
