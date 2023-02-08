/*
  Warnings:

  - You are about to drop the column `successful` on the `transaction` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('initiated', 'success', 'failed', 'pending');

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "successful",
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'initiated';
