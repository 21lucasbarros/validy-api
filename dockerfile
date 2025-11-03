# Etapa 1: build
FROM oven/bun:1 AS builder
WORKDIR /app

COPY . .

# Instala dependências
RUN bun install

# Gera o cliente Prisma
RUN bunx prisma generate

# Compila o projeto TypeScript
RUN bun run build

# Etapa 2: execução
FROM oven/bun:1-slim
WORKDIR /app

# Copia apenas o necessário do builder
COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["bun", "start"]
