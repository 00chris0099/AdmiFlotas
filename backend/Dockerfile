FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY shared/ ../shared/
COPY prisma/ ../prisma/
COPY generated/ ../generated/
COPY backend/ .

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

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY shared/ ../shared/
COPY generated/ ../generated/
COPY prisma/ ../prisma/

EXPOSE 3001

ENV PORT=3001

CMD ["node", "dist/server.js"]
