import { Resend } from "resend";
import { render } from "@react-email/render";
import CertificateExpirationEmail from "../emails/certificate-expiration";

// Inicializar Resend com a chave da API
// Obtenha sua chave em: https://resend.com/api-keys
const resend = new Resend(process.env.RESEND_API_KEY);

export interface Certificate {
  id: number;
  name: string;
  cnpj: string;
  type: string;
  expiresAt: Date;
  notificationEmails: string[];
}

export interface EmailResult {
  success: boolean;
  certificateId: number;
  certificateName: string;
  sentTo: string[];
  error?: string;
}

/**
 * Envia e-mail de notificação de expiração de certificado
 */
export async function sendCertificateExpirationEmail(
  certificate: Certificate,
  daysRemaining: number
): Promise<EmailResult> {
  try {
    // Formatar data de expiração
    const expiresAt = new Date(certificate.expiresAt).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );

    // Renderizar o template React Email em HTML
    const emailHtml = await render(
      CertificateExpirationEmail({
        certificateName: certificate.name,
        cnpj: certificate.cnpj,
        type: certificate.type,
        expiresAt,
        daysRemaining,
      })
    );

    // Enviar e-mail para todos os destinatários
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Validy <onboarding@resend.dev>",
      to: certificate.notificationEmails,
      subject: `⚠️ Certificado ${certificate.name} expira em ${daysRemaining} dias`,
      html: emailHtml,
    });

    if (error) {
      console.error("❌ Erro ao enviar e-mail:", error);
      return {
        success: false,
        certificateId: certificate.id,
        certificateName: certificate.name,
        sentTo: [],
        error: error.message,
      };
    }

    console.log("✅ E-mail enviado com sucesso:", data);
    return {
      success: true,
      certificateId: certificate.id,
      certificateName: certificate.name,
      sentTo: certificate.notificationEmails,
    };
  } catch (error) {
    console.error("❌ Erro ao processar envio de e-mail:", error);
    return {
      success: false,
      certificateId: certificate.id,
      certificateName: certificate.name,
      sentTo: [],
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Envia e-mails para múltiplos certificados
 */
export async function sendMultipleCertificateEmails(
  certificates: Certificate[],
  daysRemaining: number
): Promise<EmailResult[]> {
  const results: EmailResult[] = [];

  for (const certificate of certificates) {
    const result = await sendCertificateExpirationEmail(
      certificate,
      daysRemaining
    );
    results.push(result);

    // Pequeno delay entre e-mails para evitar rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}
