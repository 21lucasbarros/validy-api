# ============================
# 🏗️ Etapa 1: Build
# ============================
FROM oven/bun:1 AS builder
WORKDIR /app

# Copia configs principais
COPY package.json tsconfig.json bun.lock ./

# Instala dependências
RUN bun install

# Copia tudo (inclui src e prisma)
COPY . .

# Gera o Prisma Client
RUN bunx prisma generate

# Compila o projeto TypeScript
RUN bun run build

# ============================
# 🚀 Etapa 2: Execução
# ============================
FROM oven/bun:1-slim
WORKDIR /app

# Copia apenas o essencial do builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

RUN bun install --production

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["bun", "start"]
