# ============================
# 🏗️ Etapa 1: Build
# ============================
FROM oven/bun:1 AS builder
WORKDIR /app

# Copia apenas o que existe
COPY package.json tsconfig.json ./

RUN bun install
COPY . .

RUN bunx prisma generate
RUN bun run build

# ============================
# 🚀 Etapa 2: Execução
# ============================
FROM oven/bun:1-slim
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN bun install --production

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["bun", "start"]
