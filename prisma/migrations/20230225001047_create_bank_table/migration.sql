/*
  Warnings:

  - You are about to drop the column `accountNumber` on the `affiliate` table. All the data in the column will be lost.
  - You are about to drop the column `bankCode` on the `affiliate` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `affiliate` table. All the data in the column will be lost.
  - You are about to drop the column `beneficiaryId` on the `affiliate` table. All the data in the column will be lost.
  - You are about to drop the column `accountNumber` on the `store` table. All the data in the column will be lost.
  - You are about to drop the column `bankCode` on the `store` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `store` table. All the data in the column will be lost.
  - You are about to drop the column `beneficiaryId` on the `store` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "affiliate" DROP COLUMN "accountNumber",
DROP COLUMN "bankCode",
DROP COLUMN "bankName",
DROP COLUMN "beneficiaryId";

-- AlterTable
ALTER TABLE "store" DROP COLUMN "accountNumber",
DROP COLUMN "bankCode",
DROP COLUMN "bankName",
DROP COLUMN "beneficiaryId";

-- CreateTable
CREATE TABLE "Bank" (
    "id" SERIAL NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "beneficiaryId" INTEGER NOT NULL,
    "affiliateId" INTEGER,
    "storeId" INTEGER,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bank_affiliateId_key" ON "Bank"("affiliateId");

-- CreateIndex
CREATE UNIQUE INDEX "Bank_storeId_key" ON "Bank"("storeId");

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
