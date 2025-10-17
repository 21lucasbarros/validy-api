import { Elysia } from "elysia";
import { PrismaClient, CertificateType } from "@prisma/client";
import { z } from "zod";
import cors from "@elysiajs/cors";
import CryptoJS from "crypto-js";

const prisma = new PrismaClient();

// Chave secreta para criptografia (em produção, use variável de ambiente)
const SECRET_KEY = process.env.ENCRYPTION_KEY || "validy-secret-key-2024";

// validações com Zod
const CertificateSchema = z.object({
  name: z.string().min(2, "Nome inválido"),
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, "CNPJ inválido"),
  type: z.enum(["A1", "A3"]), // só A1 e A3
  expiresAt: z.string().datetime(),
  password: z.string().optional(),
  status: z.enum(["PENDING", "ON_TIME", "EXPIRED"]).optional(),
});

// Função para calcular o status baseado na data de vencimento
const calculateStatus = (
  expiresAt: Date
): "EXPIRED" | "ON_TIME" | "PENDING" => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expirationDate = new Date(expiresAt);
  expirationDate.setHours(0, 0, 0, 0);

  if (expirationDate < today) {
    return "EXPIRED";
  }

  return "PENDING"; // Por padrão, novos certificados são PENDING
};

const app = new Elysia()
  .use(cors())

  // listar todos
  .get("/certificates", async () => {
    const certificates = await prisma.certificate.findMany({
      orderBy: { expiresAt: "asc" },
    });

    // Recalcular status baseado na data de vencimento
    return certificates.map((cert) => ({
      ...cert,
      status: calculateStatus(cert.expiresAt),
    }));
  })

  // listar senhas descriptografadas
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

    // Descriptografar senhas
    return certificates.map((cert) => ({
      ...cert,
      password: cert.password
        ? CryptoJS.AES.decrypt(cert.password, SECRET_KEY).toString(
            CryptoJS.enc.Utf8
          )
        : null,
    }));
  })

  // criar novo
  .post("/certificates", async ({ body, set }) => {
    try {
      console.log("Recebendo body:", body);
      const data = CertificateSchema.parse(body);
      console.log("Dados validados:", data);

      // Criptografar senha se fornecida
      const encryptedPassword = data.password
        ? CryptoJS.AES.encrypt(data.password, SECRET_KEY).toString()
        : null;

      const expirationDate = new Date(data.expiresAt);
      const calculatedStatus = calculateStatus(expirationDate);

      const certificate = await prisma.certificate.create({
        data: {
          name: data.name,
          cnpj: data.cnpj,
          type: data.type as CertificateType,
          expiresAt: expirationDate,
          password: encryptedPassword,
          status: calculatedStatus,
        },
      });

      console.log("Certificado criado:", certificate);
      return certificate;
    } catch (err) {
      console.error("Erro ao criar certificado:", err);
      set.status = 400;
      return { error: "Dados inválidos", details: err };
    }
  })

  // atualizar
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

  // marcar como no prazo
  .patch("/certificates/:id/complete", async ({ params }) => {
    const id = Number(params.id);
    return await prisma.certificate.update({
      where: { id },
      data: { status: "ON_TIME" },
    });
  })

  // deletar
  .delete("/certificates/:id", async ({ params }) => {
    const id = Number(params.id);
    await prisma.certificate.delete({ where: { id } });
    return { message: "Certificado deletado com sucesso" };
  })

  // teste
  .get("/", () => "✅ Validy API is running!");

// Handler para Vercel serverless functions
export default app.fetch;
