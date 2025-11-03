import { Elysia } from "elysia";
import { PrismaClient, CertificateType } from "@prisma/client";
import { z } from "zod";
import cors from "@elysiajs/cors";
import CryptoJS from "crypto-js";

const prisma = new PrismaClient();

// Chave secreta (usa variável de ambiente em produção)
const SECRET_KEY = process.env.ENCRYPTION_KEY || "validy-secret-key-2024";

// Validação com Zod
const CertificateSchema = z.object({
  name: z.string().min(2, "Nome inválido"),
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, "CNPJ inválido"),
  type: z.enum(["A1", "A3"]),
  expiresAt: z.string().datetime(),
  password: z.string().optional(),
  status: z.enum(["PENDING", "ON_TIME"]).optional(),
});

const app = new Elysia()
  .use(cors())

  // Listar todos os certificados
  .get("/certificates", async () => {
    return await prisma.certificate.findMany({
      orderBy: { expiresAt: "asc" },
    });
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

    // Descriptografar as senhas antes de retornar
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
      console.log("Recebendo body:", body);
      const data = CertificateSchema.parse(body);

      const encryptedPassword = data.password
        ? CryptoJS.AES.encrypt(data.password, SECRET_KEY).toString()
        : null;

      const certificate = await prisma.certificate.create({
        data: {
          name: data.name,
          cnpj: data.cnpj,
          type: data.type as CertificateType,
          expiresAt: new Date(data.expiresAt),
          password: encryptedPassword,
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

  // Marcar como "no prazo"
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
  })

  // Rota teste (healthcheck)
  .get("/", () => "✅ Validy API is running!");

// Iniciar servidor
const port = Number(process.env.PORT) || 8080;
const hostname = "0.0.0.0";

app.listen({ port, hostname });

console.log(`🦊 Validy API running on http://${hostname}:${port}`);
