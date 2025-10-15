import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface CertificateExpirationEmailProps {
  certificateName: string;
  cnpj: string;
  type: string;
  expiresAt: string;
  daysRemaining: number;
}

export const CertificateExpirationEmail = ({
  certificateName = "Empresa Exemplo",
  cnpj = "00.000.000/0000-00",
  type = "A1",
  expiresAt = "25/10/2025",
  daysRemaining = 10,
}: CertificateExpirationEmailProps) => {
  const previewText = `⚠️ Certificado ${certificateName} expira em ${daysRemaining} dias`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚠️ Alerta de Expiração</Heading>

          <Text style={text}>
            O certificado digital está próximo do vencimento e requer atenção
            imediata.
          </Text>

          <Section style={certificateBox}>
            <Text style={label}>Cliente:</Text>
            <Text style={value}>{certificateName}</Text>

            <Text style={label}>CNPJ:</Text>
            <Text style={value}>{cnpj}</Text>

            <Text style={label}>Tipo de Certificado:</Text>
            <Text style={value}>{type}</Text>

            <Text style={label}>Data de Expiração:</Text>
            <Text style={value}>{expiresAt}</Text>

            <Text style={alertText}>
              ⏰ Faltam apenas <strong>{daysRemaining} dias</strong> para o
              vencimento!
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Esta é uma notificação automática do sistema Validy.
            <br />
            Por favor, providencie a renovação o quanto antes.
          </Text>

          <Text style={footerGray}>
            © {new Date().getFullYear()} Validy - Sistema de Gestão de
            Certificados Digitais
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default CertificateExpirationEmail;

// Estilos
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 40px",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const certificateBox = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  border: "2px solid #e9ecef",
  margin: "24px 40px",
  padding: "24px",
};

const label = {
  color: "#6c757d",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  margin: "12px 0 4px 0",
  letterSpacing: "0.5px",
};

const value = {
  color: "#212529",
  fontSize: "16px",
  fontWeight: "500",
  margin: "0 0 8px 0",
};

const alertText = {
  backgroundColor: "#fff3cd",
  borderLeft: "4px solid #ffc107",
  color: "#856404",
  fontSize: "16px",
  fontWeight: "500",
  padding: "16px",
  margin: "20px 0 0 0",
  borderRadius: "4px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 40px",
};

const footer = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
  textAlign: "center" as const,
};

const footerGray = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 40px",
  textAlign: "center" as const,
  marginTop: "24px",
};
