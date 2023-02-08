/*
  Warnings:

  - Made the column `transactionId` on table `subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_transactionId_fkey";

-- AlterTable
ALTER TABLE "subscription" ALTER COLUMN "active" SET DEFAULT false,
ALTER COLUMN "transactionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
