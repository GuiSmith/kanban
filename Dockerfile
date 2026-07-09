# =========================
# BASE
# =========================
FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./

FROM base AS builder

RUN npm ci

COPY . .

RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

# instala apenas deps de produção
RUN npm ci --omit=dev

# copia build gerada
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/src ./src

EXPOSE 3000

CMD ["npm", "start"]
