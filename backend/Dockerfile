# Multi-Stage Node.js 20 Alpine Dockerfile for Backend API
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Security hardening: run as unprivileged user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressuser

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY . .

RUN chown -R expressuser:nodejs /app

USER expressuser

EXPOSE 5000

CMD ["node", "server.js"]
