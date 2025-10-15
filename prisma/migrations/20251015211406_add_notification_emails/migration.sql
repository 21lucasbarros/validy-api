-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('A1', 'A3');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "Certificate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "type" "CertificateType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "notificationEmails" TEXT[],
    "status" "CertificateStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);
