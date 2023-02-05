/*
  Warnings:

  - The values [AFFILIATE_SUBSCRIPTION] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('AFFILIATE_DEFAULT');

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('SUBSCRIPTION', 'PRODUCT_PURCHASE', 'STORE_WITHDRAWAL', 'AFFILIATE_WITHDRAWAL');
ALTER TABLE "transaction" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "affiliate" ADD COLUMN     "plan" "SubscriptionPlan" NOT NULL DEFAULT 'AFFILIATE_DEFAULT';
