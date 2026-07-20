# syntax=docker/dockerfile:1

# =========================================================
# Dependências
# =========================================================
FROM node:22-bookworm-slim AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./

# Instala dependencies e devDependencies necessárias ao build
RUN npm ci


# =========================================================
# Build
# =========================================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

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
FROM node:22-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0

# Usuário sem privilégios
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Aplicação standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Dependência nativa carregada dinamicamente
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcrypt ./node_modules/bcrypt
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/node-gyp-build ./node_modules/node-gyp-build

# Arquivos estáticos não são copiados automaticamente para standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Arquivos necessários para executar sua migration própria
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

USER nextjs

CMD ["sh", "-c", "node src/database/migrate.js && exec node server.js"]
