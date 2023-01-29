-- AlterTable
ALTER TABLE "affiliate" ADD COLUMN     "referredBy" INTEGER;

-- AddForeignKey
ALTER TABLE "affiliate" ADD CONSTRAINT "affiliate_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES "affiliate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
