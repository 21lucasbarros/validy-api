import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { sendMultipleCertificateEmails } from "../services/email.service";

const prisma = new PrismaClient();

/**
 * Verifica certificados que expiram em X dias e envia notificações
 */
export async function checkExpiringCertificates(daysThreshold: number = 10) {
  try {
    console.log(
      `🔍 Verificando certificados expirando em ${daysThreshold} dias...`
    );

    // Calcular data limite (hoje + X dias)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + daysThreshold);
    targetDate.setHours(23, 59, 59, 999);

    // Buscar certificados que expiram exatamente em X dias (pendentes)
    const expiringCertificates = await prisma.certificate.findMany({
      where: {
        status: "PENDING",
        expiresAt: {
          gte: today,
          lte: targetDate,
        },
      },
    });

    if (expiringCertificates.length === 0) {
      console.log(`✅ Nenhum certificado expirando em ${daysThreshold} dias.`);
      return {
        checked: 0,
        sent: 0,
        results: [],
      };
    }

    console.log(
      `📧 Encontrados ${expiringCertificates.length} certificado(s) expirando. Enviando notificações...`
    );

    // Enviar e-mails
    const results = await sendMultipleCertificateEmails(
      expiringCertificates,
      daysThreshold
    );

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    console.log(`✅ E-mails enviados: ${successCount}`);
    if (failCount > 0) {
      console.log(`❌ Falhas: ${failCount}`);
    }

    return {
      checked: expiringCertificates.length,
      sent: successCount,
      failed: failCount,
      results,
    };
  } catch (error) {
    console.error("❌ Erro ao verificar certificados expirando:", error);
    throw error;
  }
}

/**
 * Inicia o cron job para verificação automática
 * Executa todos os dias às 9h da manhã
 */
export function startExpirationCheckCron() {
  // Cron: "0 9 * * *" = Todos os dias às 9h
  // Para testes, use: "* * * * *" (a cada minuto)
  const schedule = process.env.CRON_SCHEDULE || "0 9 * * *";

  console.log(`⏰ Iniciando cron job de verificação de expiração...`);
  console.log(`📅 Agendamento: ${schedule}`);

  const task = cron.schedule(schedule, async () => {
    console.log("\n⏰ Executando verificação agendada de certificados...");
    try {
      await checkExpiringCertificates(10); // 10 dias de antecedência
    } catch (error) {
      console.error("❌ Erro na verificação agendada:", error);
    }
  });

  task.start();
  console.log("✅ Cron job iniciado com sucesso!");

  return task;
}
