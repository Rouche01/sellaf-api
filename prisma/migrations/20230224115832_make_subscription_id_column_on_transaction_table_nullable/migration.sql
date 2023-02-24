-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_subscriptionId_fkey";

-- AlterTable
ALTER TABLE "transaction" ALTER COLUMN "subscriptionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
