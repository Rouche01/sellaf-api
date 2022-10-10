/*
  Warnings:

  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Store` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Country" AS ENUM ('NG', 'GH', 'KE', 'RW');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('AFFILIATE_SUBSCRIPTION', 'PRODUCT_PURCHASE', 'STORE_WITHDRAWAL', 'AFFILIATE_WITHDRAWAL');

-- CreateEnum
CREATE TYPE "ChargeType" AS ENUM ('DEBIT', 'CREDIT');

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_sellerId_fkey";

-- AlterTable
ALTER TABLE "affiliate" ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankCode" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "beneficiaryId" INTEGER;

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "Store";

-- CreateTable
CREATE TABLE "store" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "bankCode" TEXT,
    "beneficiaryId" INTEGER,
    "country" "Country" NOT NULL DEFAULT 'NG',
    "currency" "Currency" NOT NULL DEFAULT 'NGN',
    "totalEarning" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "amountWithdrawn" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "sellerId" INTEGER NOT NULL,

    CONSTRAINT "store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "chargeType" "ChargeType" NOT NULL,
    "successful" BOOLEAN NOT NULL DEFAULT false,
    "flutterwaveRef" TEXT,
    "coinbaseRef" TEXT,
    "address" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "initiatedBy" INTEGER NOT NULL,
    "storeId" INTEGER,
    "productId" INTEGER,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "store_name_key" ON "store"("name");

-- AddForeignKey
ALTER TABLE "store" ADD CONSTRAINT "store_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_initiatedBy_fkey" FOREIGN KEY ("initiatedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
