# ============================================================
# SAF - Dockerfile for EasyPanel
# Builds and runs the backend API server
# ============================================================

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
ARG SMTP_HOST
ARG SMTP_PORT
ARG SMTP_USER
ARG SMTP_PASS
ARG SMTP_FROM
ARG GIT_SHA

ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET
ENV SMTP_HOST=$SMTP_HOST
ENV SMTP_PORT=$SMTP_PORT
ENV SMTP_USER=$SMTP_USER
ENV SMTP_PASS=$SMTP_PASS
ENV SMTP_FROM=$SMTP_FROM
ENV GIT_SHA=$GIT_SHA

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY backend/package*.json ./
RUN npm install --omit=dev --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY shared/ ../shared/
COPY generated/ ../generated/
COPY prisma/ ../prisma/

ARG DATABASE_URL
ARG JWT_SECRET
ARG SMTP_HOST
ARG SMTP_PORT
ARG SMTP_USER
ARG SMTP_PASS
ARG SMTP_FROM
ARG GIT_SHA

ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET
ENV SMTP_HOST=$SMTP_HOST
ENV SMTP_PORT=$SMTP_PORT
ENV SMTP_USER=$SMTP_USER
ENV SMTP_PASS=$SMTP_PASS
ENV SMTP_FROM=$SMTP_FROM
ENV GIT_SHA=$GIT_SHA
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/server.js"]
