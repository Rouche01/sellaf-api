-- DropForeignKey
ALTER TABLE "affiliate" DROP CONSTRAINT "affiliate_userId_fkey";

-- DropForeignKey
ALTER TABLE "bank" DROP CONSTRAINT "bank_affiliateId_fkey";

-- DropForeignKey
ALTER TABLE "bank" DROP CONSTRAINT "bank_storeId_fkey";

-- DropForeignKey
ALTER TABLE "confirmation_token" DROP CONSTRAINT "confirmation_token_userId_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_storeId_fkey";

-- DropForeignKey
ALTER TABLE "seller" DROP CONSTRAINT "seller_userId_fkey";

-- DropForeignKey
ALTER TABLE "store" DROP CONSTRAINT "store_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_affiliateId_fkey";

-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_initiatedBy_fkey";

-- DropForeignKey
ALTER TABLE "user_has_role" DROP CONSTRAINT "user_has_role_userId_fkey";

-- AlterTable
ALTER TABLE "subscription" ALTER COLUMN "affiliateId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "transaction" ALTER COLUMN "initiatedBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user_has_role" ADD CONSTRAINT "user_has_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller" ADD CONSTRAINT "seller_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate" ADD CONSTRAINT "affiliate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmation_token" ADD CONSTRAINT "confirmation_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store" ADD CONSTRAINT "store_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_initiatedBy_fkey" FOREIGN KEY ("initiatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank" ADD CONSTRAINT "bank_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank" ADD CONSTRAINT "bank_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
