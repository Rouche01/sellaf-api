/*
  Warnings:

  - Added the required column `referenceCode` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "referenceCode" TEXT NOT NULL,
ADD COLUMN     "referredBy" INTEGER;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
