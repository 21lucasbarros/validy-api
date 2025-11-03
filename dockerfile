# ============================
# 🏗️ Etapa 1: Build
# ============================
FROM oven/bun:1 AS builder
WORKDIR /app

# Copia apenas os arquivos necessários primeiro (melhora cache)
COPY package.json bun.lockb tsconfig.json ./

# Instala dependências (sem devDependencies em produção ainda)
RUN bun install

# Copia o restante do código
COPY . .

# Gera o cliente Prisma
RUN bunx prisma generate

# Compila o TypeScript
RUN bun run build


# ============================
# 🚀 Etapa 2: Execução
# ============================
FROM oven/bun:1-slim
WORKDIR /app

# Copia apenas o necessário da etapa anterior
COPY --from=builder /app/package.json /app/bun.lockb ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Reinstala apenas as deps de produção
RUN bun install --production

ENV NODE_ENV=production
ENV PORT=8080

# Expõe a porta 8080 (obrigatório no Cloud Run)
EXPOSE 8080

# Comando de inicialização
CMD ["bun", "start"]
