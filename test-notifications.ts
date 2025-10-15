#!/usr/bin/env node

/**
 * Script de teste para o sistema de notificações
 *
 * Como usar:
 * bun run test-notifications.ts
 */

console.log("🧪 Testando sistema de notificações...\n");

const API_URL = "http://localhost:3333";

async function testNotificationSystem() {
  try {
    // 1. Verificar se a API está rodando
    console.log("1️⃣ Verificando API...");
    const healthCheck = await fetch(API_URL);
    const healthText = await healthCheck.text();
    console.log(`   ✅ API: ${healthText}\n`);

    // 2. Criar certificado de teste (expira em 10 dias)
    console.log("2️⃣ Criando certificado de teste (expira em 10 dias)...");
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 10);

    const testCertificate = {
      name: "Empresa Teste Ltda",
      cnpj: "12.345.678/0001-90",
      type: "A1",
      expiresAt: expirationDate.toISOString(),
      notificationEmails: [
        "seu-email@example.com", // ⚠️ ALTERE AQUI!
      ],
    };

    const createResponse = await fetch(`${API_URL}/certificates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testCertificate),
    });

    const createdCert = await createResponse.json();
    console.log(`   ✅ Certificado criado:`, {
      id: createdCert.id,
      name: createdCert.name,
      expiresAt: new Date(createdCert.expiresAt).toLocaleDateString("pt-BR"),
    });
    console.log();

    // 3. Enviar notificação manualmente
    console.log("3️⃣ Enviando notificações...");
    const notifyResponse = await fetch(
      `${API_URL}/notifications/send-expiring`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ daysThreshold: 10 }),
      }
    );

    const notifyResult = await notifyResponse.json();
    console.log(`   ✅ Resultado:`, notifyResult);
    console.log();

    // 4. Instruções
    console.log("📧 Próximos passos:");
    console.log("   1. Verifique sua caixa de entrada");
    console.log("   2. Verifique o spam se não encontrar");
    console.log("   3. Acesse https://resend.com/emails para ver o histórico");
    console.log();
    console.log("🧹 Limpeza:");
    console.log(
      `   Para deletar o certificado de teste: DELETE ${API_URL}/certificates/${createdCert.id}`
    );
  } catch (error) {
    console.error("❌ Erro:", error);
    console.log("\n⚠️ Certifique-se de que:");
    console.log("   1. A API está rodando (bun run dev)");
    console.log(
      "   2. As variáveis RESEND_API_KEY e RESEND_FROM_EMAIL estão configuradas no .env"
    );
    console.log("   3. O e-mail no script está correto");
  }
}

testNotificationSystem();
