import { Elysia } from "elysia";
import { PrismaClient, CertificateType } from "@prisma/client";
import { z } from "zod";
import cors from "@elysiajs/cors";
import CryptoJS from "crypto-js";

// --- CONFIGURAÇÃO DO PRISMA (SINGLETON) ---
// Impede a criação de novas conexões a cada "cold start" ou "hot reload"
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Chave secreta para criptografia
const SECRET_KEY = process.env.ENCRYPTION_KEY || "validy-secret-key-2024";

// --- VALIDAÇÕES E UTILITÁRIOS ---
const CertificateSchema = z.object({
  name: z.string().min(2, "Nome inválido"),
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, "CNPJ inválido"),
  type: z.enum(["A1", "A3"]),
  expiresAt: z.string().datetime(),
  password: z.string().optional(),
  status: z.enum(["PENDING", "ON_TIME", "EXPIRED"]).optional(),
});

const calculateStatus = (
  expiresAt: Date,
): "EXPIRED" | "ON_TIME" | "PENDING" => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expirationDate = new Date(expiresAt);
  expirationDate.setHours(0, 0, 0, 0);

  if (expirationDate < today) return "EXPIRED";
  return "PENDING";
};

// --- DEFINIÇÃO DA API ---
const app = new Elysia()
  .use(cors())

  // Rota de teste
  .get("/", () => ({
    status: "online",
    message: "✅ Validy API is running on Bun!",
  }))

  // Listar todos os certificados
  .get("/certificates", async () => {
    const certificates = await prisma.certificate.findMany({
      orderBy: { expiresAt: "asc" },
    });

    return certificates.map((cert) => ({
      ...cert,
      status: calculateStatus(cert.expiresAt),
    }));
  })

  // Listar senhas descriptografadas
  .get("/certificates/passwords", async () => {
    const certificates = await prisma.certificate.findMany({
      select: {
        id: true,
        name: true,
        cnpj: true,
        password: true,
      },
      orderBy: { name: "asc" },
    });

    return certificates.map((cert) => ({
      ...cert,
      password: cert.password
        ? CryptoJS.AES.decrypt(cert.password, SECRET_KEY).toString(
            CryptoJS.enc.Utf8,
          )
        : null,
    }));
  })

  // Criar novo certificado
  .post("/certificates", async ({ body, set }) => {
    try {
      const data = CertificateSchema.parse(body);

      const encryptedPassword = data.password
        ? CryptoJS.AES.encrypt(data.password, SECRET_KEY).toString()
        : null;

      const expirationDate = new Date(data.expiresAt);
      const initialStatus = calculateStatus(expirationDate);

      const certificate = await prisma.certificate.create({
        data: {
          name: data.name,
          cnpj: data.cnpj,
          type: data.type as CertificateType,
          expiresAt: expirationDate,
          password: encryptedPassword,
          status: initialStatus,
        },
      });

      return certificate;
    } catch (err) {
      set.status = 400;
      return { error: "Dados inválidos", details: err };
    }
  })

  // Atualizar certificado
  .put("/certificates/:id", async ({ params, body, set }) => {
    try {
      const id = Number(params.id);
      const data = CertificateSchema.partial().parse(body);

      return await prisma.certificate.update({
        where: { id },
        data: {
          ...data,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        },
      });
    } catch (err) {
      set.status = 400;
      return { error: "Erro ao atualizar", details: err };
    }
  })

  // Marcar como concluído/no prazo
  .patch("/certificates/:id/complete", async ({ params }) => {
    const id = Number(params.id);
    return await prisma.certificate.update({
      where: { id },
      data: { status: "ON_TIME" },
    });
  })

  // Deletar certificado
  .delete("/certificates/:id", async ({ params }) => {
    const id = Number(params.id);
    await prisma.certificate.delete({ where: { id } });
    return { message: "Certificado deletado com sucesso" };
  });

// --- EXPORTAÇÃO PARA VERCEL (BUN RUNTIME) ---
export default app;

// Execução local
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 8080;
  app.listen(port);
  console.log(`🦊 Validy API running locally at http://localhost:${port}`);
}
