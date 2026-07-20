# syntax=docker/dockerfile:1

# =========================================================
# Dependências
# =========================================================
FROM node:22-alpine AS dependencies

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./

# Instala dependencies e devDependencies necessárias ao build
RUN npm ci


# =========================================================
# Build
# =========================================================
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Gera o Prisma Client baseado no schema.prisma commitado
RUN npx prisma generate

# Executa next build e produz .next/standalone
RUN npm run build


# =========================================================
# Produção
# =========================================================
FROM node:22-alpine AS production

WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0

# Usuário sem privilégios
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Aplicação standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Arquivos estáticos não são copiados automaticamente para standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Arquivos necessários para executar sua migration própria
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

USER nextjs

CMD ["sh", "-c", "node src/database/migrate.js && exec node server.js"]