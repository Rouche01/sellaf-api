/*
  Warnings:

  - A unique constraint covering the columns `[activeTransactionId]` on the table `subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "activeTransactionId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "subscription_activeTransactionId_key" ON "subscription"("activeTransactionId");

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_activeTransactionId_fkey" FOREIGN KEY ("activeTransactionId") REFERENCES "transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
