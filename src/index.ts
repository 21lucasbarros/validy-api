import { Elysia } from "elysia";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import cors from "@elysiajs/cors";

const prisma = new PrismaClient();

// validações com Zod
const CertificateSchema = z.object({
  name: z.string().min(2, "Nome inválido"),
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, "CNPJ inválido"),
  type: z.enum(["A1", "A3"]), // só A1 e A3
  expiresAt: z.string().datetime(),
  notificationEmails: z
    .array(z.string().email())
    .min(1, "Pelo menos um email é necessário"),
  status: z.enum(["PENDING", "COMPLETED"]).optional(),
});

const app = new Elysia()
  .use(cors())

  // listar todos
  .get("/certificates", async () => {
    return await prisma.certificate.findMany({
      orderBy: { expiresAt: "asc" },
    });
  })

  // criar novo
  .post("/certificates", async ({ body, set }) => {
    try {
      console.log("Recebendo body:", body);
      const data = CertificateSchema.parse(body);
      console.log("Dados validados:", data);
      
      const certificate = await prisma.certificate.create({
        data: {
          name: data.name,
          cnpj: data.cnpj,
          type: data.type,
          expiresAt: new Date(data.expiresAt),
          notificationEmails: data.notificationEmails,
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
          notificationEmails: data.notificationEmails,
        },
      });
    } catch (err) {
      set.status = 400;
      return { error: "Erro ao atualizar", details: err };
    }
  })

  // marcar como concluído
  .patch("/certificates/:id/complete", async ({ params }) => {
    const id = Number(params.id);
    return await prisma.certificate.update({
      where: { id },
      data: { status: "COMPLETED" },
    });
  })

  // deletar
  .delete("/certificates/:id", async ({ params }) => {
    const id = Number(params.id);
    await prisma.certificate.delete({ where: { id } });
    return { message: "Certificado deletado com sucesso" };
  })

  // teste
  .get("/", () => "✅ Validy API is running!")

  .listen(3333);

console.log(
  `🦊 Validy API running at http://${app.server?.hostname}:${app.server?.port}`
);
