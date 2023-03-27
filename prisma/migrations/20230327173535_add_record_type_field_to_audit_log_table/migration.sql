/*
  Warnings:

  - Added the required column `record` to the `AuditLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuditLogRecordType" AS ENUM ('USER', 'STORE');

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "record" "AuditLogRecordType" NOT NULL;
