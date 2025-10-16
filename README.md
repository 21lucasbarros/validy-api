# Validy API 🚀

API REST para gerenciamento de certificados digitais desenvolvida com **Elysia**, **TypeScript**, **Prisma** e **PostgreSQL**.

## 📋 Sobre o Projeto

A **Validy API** é uma solução backend completa para controle e monitoramento de certificados digitais (A1 e A3). O sistema permite cadastrar, atualizar, listar e gerenciar o status de certificados, além de configurar e-mails de notificação para alertas de vencimento.

### Principais Funcionalidades

- ✅ CRUD completo de certificados digitais
- ✅ Validação de dados com Zod
- ✅ Suporte para certificados A1 e A3
- ✅ Gerenciamento de status (Pendente/Concluído)
- ✅ Múltiplos e-mails de notificação por certificado
- ✅ Validação de CNPJ
- ✅ Ordenação automática por data de vencimento

## 🛠️ Tecnologias Utilizadas

- **[Elysia](https://elysiajs.com/)** - Framework web ultra-rápido para Bun
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Prisma](https://www.prisma.io/)** - ORM moderno para TypeScript/Node.js
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[Zod](https://zod.dev/)** - Validação de schemas TypeScript-first
- **[Bun](https://bun.sh/)** - Runtime JavaScript/TypeScript performático

## 📦 Instalação

### Pré-requisitos

- [Bun](https://bun.sh/) instalado (v1.0+)
- [PostgreSQL](https://www.postgresql.org/) instalado e rodando
- Node.js 18+ (opcional, para compatibilidade)

### Passo a Passo

1. **Clone o repositório**

```bash
git clone https://github.com/21lucasbarros/validy-api.git
cd validy-api
```

2. **Instale as dependências**

```bash
bun install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do PostgreSQL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/validy"
```

4. **Execute as migrações do banco de dados**

```bash
bun run db:migrate
```

5. **Inicie o servidor de desenvolvimento**

```bash
bun run dev
```

A API estará rodando em `http://localhost:3333` 🎉

## 📚 Documentação da API

### Base URL

```
http://localhost:3333
```

### Endpoints

#### 🔍 **GET** `/`

Verifica o status da API.

**Resposta:**

```json
"✅ Validy API is running!"
```

---

#### 📋 **GET** `/certificates`

Lista todos os certificados ordenados por data de vencimento.

**Resposta de Sucesso (200):**

```json
[
  {
    "id": 1,
    "name": "Empresa ABC Ltda",
    "cnpj": "12.345.678/0001-90",
    "type": "A1",
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "notificationEmails": ["contato@empresa.com", "ti@empresa.com"],
    "status": "PENDING",
    "createdAt": "2025-10-16T10:00:00.000Z"
  }
]
```

---

#### ➕ **POST** `/certificates`

Cria um novo certificado.

**Body:**

```json
{
  "name": "Empresa ABC Ltda",
  "cnpj": "12.345.678/0001-90",
  "type": "A1",
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "notificationEmails": ["contato@empresa.com", "ti@empresa.com"]
}
```

**Validações:**

- `name`: String com no mínimo 2 caracteres
- `cnpj`: Formato `XX.XXX.XXX/XXXX-XX` ou `XXXXXXXXXXXXXX` (14 dígitos)
- `type`: Apenas `"A1"` ou `"A3"`
- `expiresAt`: String em formato ISO 8601 (DateTime)
- `notificationEmails`: Array com no mínimo 1 e-mail válido
- `status`: Opcional, padrão é `"PENDING"`

**Resposta de Sucesso (200):**

```json
{
  "id": 1,
  "name": "Empresa ABC Ltda",
  "cnpj": "12.345.678/0001-90",
  "type": "A1",
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "notificationEmails": ["contato@empresa.com", "ti@empresa.com"],
  "status": "PENDING",
  "createdAt": "2025-10-16T10:00:00.000Z"
}
```

**Resposta de Erro (400):**

```json
{
  "error": "Dados inválidos",
  "details": { ... }
}
```

---

#### ✏️ **PUT** `/certificates/:id`

Atualiza um certificado existente.

**Parâmetros:**

- `id` (URL): ID do certificado

**Body (todos os campos são opcionais):**

```json
{
  "name": "Empresa ABC Ltda - Atualizada",
  "cnpj": "98.765.432/0001-10",
  "type": "A3",
  "expiresAt": "2026-01-31T23:59:59.000Z",
  "notificationEmails": ["novo@empresa.com"]
}
```

**Resposta de Sucesso (200):**

```json
{
  "id": 1,
  "name": "Empresa ABC Ltda - Atualizada",
  "cnpj": "98.765.432/0001-10",
  "type": "A3",
  "expiresAt": "2026-01-31T23:59:59.000Z",
  "notificationEmails": ["novo@empresa.com"],
  "status": "PENDING",
  "createdAt": "2025-10-16T10:00:00.000Z"
}
```

**Resposta de Erro (400):**

```json
{
  "error": "Erro ao atualizar",
  "details": { ... }
}
```

---

#### ✅ **PATCH** `/certificates/:id/complete`

Marca um certificado como concluído.

**Parâmetros:**

- `id` (URL): ID do certificado

**Resposta de Sucesso (200):**

```json
{
  "id": 1,
  "name": "Empresa ABC Ltda",
  "cnpj": "12.345.678/0001-90",
  "type": "A1",
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "notificationEmails": ["contato@empresa.com"],
  "status": "COMPLETED",
  "createdAt": "2025-10-16T10:00:00.000Z"
}
```

---

#### 🗑️ **DELETE** `/certificates/:id`

Remove um certificado.

**Parâmetros:**

- `id` (URL): ID do certificado

**Resposta de Sucesso (200):**

```json
{
  "message": "Certificado deletado com sucesso"
}
```

---

## 🗄️ Modelo de Dados

### Certificate

| Campo              | Tipo              | Descrição                                 |
| ------------------ | ----------------- | ----------------------------------------- |
| id                 | Int               | ID único auto-incrementado                |
| name               | String            | Nome da empresa/cliente                   |
| cnpj               | String            | CNPJ formatado ou apenas números          |
| type               | CertificateType   | Tipo do certificado (A1 ou A3)            |
| expiresAt          | DateTime          | Data de vencimento do certificado         |
| notificationEmails | String[]          | Lista de e-mails para notificação         |
| status             | CertificateStatus | Status do certificado (PENDING/COMPLETED) |
| createdAt          | DateTime          | Data de criação (automática)              |

### Enums

**CertificateType:**

- `A1` - Certificado digital tipo A1
- `A3` - Certificado digital tipo A3

**CertificateStatus:**

- `PENDING` - Certificado pendente de renovação
- `COMPLETED` - Certificado renovado/concluído

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento com hot-reload
bun run dev

# Build para produção
bun run build

# Inicia servidor de produção
bun run start

# Gera o Prisma Client
bun run db:generate

# Executa migrações do banco
bun run db:migrate

# Abre o Prisma Studio (interface visual do DB)
bun run db:studio
```

## 📁 Estrutura do Projeto

```
validy-api/
├── prisma/
│   ├── migrations/          # Histórico de migrações
│   └── schema.prisma        # Schema do banco de dados
├── src/
│   └── index.ts             # Arquivo principal da API
├── .env                     # Variáveis de ambiente (não versionado)
├── .env.example             # Exemplo de configuração
├── package.json             # Dependências e scripts
├── tsconfig.json            # Configuração TypeScript
└── README.md                # Este arquivo
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/validy"
```

## 🧪 Testando a API

### Usando cURL

```bash
# Listar certificados
curl http://localhost:3333/certificates

# Criar certificado
curl -X POST http://localhost:3333/certificates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Ltda",
    "cnpj": "12.345.678/0001-90",
    "type": "A1",
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "notificationEmails": ["teste@email.com"]
  }'

# Atualizar certificado
curl -X PUT http://localhost:3333/certificates/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Teste Atualizado"}'

# Marcar como concluído
curl -X PATCH http://localhost:3333/certificates/1/complete

# Deletar certificado
curl -X DELETE http://localhost:3333/certificates/1
```

---

## 🚀 Deploy na Vercel

### Configuração do Projeto

Este projeto está configurado para deploy automático na Vercel com suporte a serverless functions.

### Passo a Passo para Deploy

1. **Instale a CLI da Vercel** (se ainda não tiver)

```bash
npm i -g vercel
```

2. **Configure o banco de dados PostgreSQL**

Você precisa de um banco PostgreSQL em produção. Recomendações:

- **[Neon](https://neon.tech/)** - PostgreSQL serverless gratuito
- **[Supabase](https://supabase.com/)** - PostgreSQL com recursos extras
- **[Railway](https://railway.app/)** - PostgreSQL gerenciado

3. **Configure as variáveis de ambiente na Vercel**

Acesse o dashboard da Vercel e adicione:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?pgbouncer=true&connection_limit=1"
```

⚠️ **Importante**: Para serverless, use connection pooling (como PgBouncer) para evitar excesso de conexões.

4. **Faça o deploy**

```bash
# Login na Vercel
vercel login

# Deploy para produção
vercel --prod
```

### Configuração Automática

O projeto já possui:

- ✅ `vercel.json` - Configuração de rotas serverless
- ✅ `api/index.ts` - Handler serverless compatível
- ✅ Script `vercel-build` - Gera Prisma Client e aplica migrations

### Testar Localmente com Vercel

```bash
# Instalar dependências
npm install

# Rodar servidor Vercel local
npm run dev:vercel
```

A API estará disponível em `http://localhost:3000`

### URL de Produção

Após o deploy, sua API estará disponível em:

```
https://seu-projeto.vercel.app
```

### Endpoints em Produção

```
GET    https://seu-projeto.vercel.app/
GET    https://seu-projeto.vercel.app/certificates
POST   https://seu-projeto.vercel.app/certificates
PUT    https://seu-projeto.vercel.app/certificates/:id
PATCH  https://seu-projeto.vercel.app/certificates/:id/complete
DELETE https://seu-projeto.vercel.app/certificates/:id
```

### Troubleshooting

**Erro de timeout?**

- Serverless functions da Vercel têm limite de 10s (plano gratuito)
- Use connection pooling no DATABASE_URL

**Prisma não encontrado?**

- O script `vercel-build` roda automaticamente `prisma generate`
- Verifique se `@prisma/client` está em `dependencies` (não `devDependencies`)

**Migrations não aplicadas?**

- Execute `prisma migrate deploy` manualmente ou
- Configure um CI/CD para rodar migrations antes do deploy

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abrir um Pull Request

## 📝 Licença

Este projeto está sob a licença ISC.

## 👨‍💻 Autor

**Lucas Barros Simon**

---

⭐ Se este projeto foi útil para você, considere dar uma estrela!
