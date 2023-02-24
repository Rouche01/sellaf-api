/*
  Warnings:

  - You are about to drop the column `transactionId` on the `subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subscriptionId]` on the table `transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subscriptionId` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_transactionId_fkey";

-- DropIndex
DROP INDEX "subscription_transactionId_key";

-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "transactionId";

-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "subscriptionId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "transaction_subscriptionId_key" ON "transaction"("subscriptionId");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
