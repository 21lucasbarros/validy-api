/*
  Warnings:

  - The values [COMPLETED] on the enum `CertificateStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CertificateStatus_new" AS ENUM ('PENDING', 'ON_TIME');
ALTER TABLE "public"."Certificate" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Certificate" ALTER COLUMN "status" TYPE "CertificateStatus_new" USING ("status"::text::"CertificateStatus_new");
ALTER TYPE "CertificateStatus" RENAME TO "CertificateStatus_old";
ALTER TYPE "CertificateStatus_new" RENAME TO "CertificateStatus";
DROP TYPE "public"."CertificateStatus_old";
ALTER TABLE "Certificate" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
