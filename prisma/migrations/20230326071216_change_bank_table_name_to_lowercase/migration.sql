/*
  Warnings:

  - You are about to drop the `Bank` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bank" DROP CONSTRAINT "Bank_affiliateId_fkey";

-- DropForeignKey
ALTER TABLE "Bank" DROP CONSTRAINT "Bank_storeId_fkey";

-- DropTable
DROP TABLE "Bank";

-- CreateTable
CREATE TABLE "bank" (
    "id" SERIAL NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "beneficiaryId" INTEGER NOT NULL,
    "affiliateId" INTEGER,
    "storeId" INTEGER,

    CONSTRAINT "bank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bank_affiliateId_key" ON "bank"("affiliateId");

-- CreateIndex
CREATE UNIQUE INDEX "bank_storeId_key" ON "bank"("storeId");

-- AddForeignKey
ALTER TABLE "bank" ADD CONSTRAINT "bank_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank" ADD CONSTRAINT "bank_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
