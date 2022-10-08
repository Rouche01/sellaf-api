/*
  Warnings:

  - Made the column `totalEarnings` on table `affiliate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `amountWithdrawn` on table `affiliate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `balance` on table `affiliate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalEarning` on table `seller` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('NGN', 'GHS', 'KES', 'RWF');

-- AlterTable
ALTER TABLE "affiliate" ALTER COLUMN "totalEarnings" SET NOT NULL,
ALTER COLUMN "totalEarnings" SET DEFAULT 0,
ALTER COLUMN "totalEarnings" SET DATA TYPE DECIMAL(25,2),
ALTER COLUMN "amountWithdrawn" SET NOT NULL,
ALTER COLUMN "amountWithdrawn" SET DEFAULT 0,
ALTER COLUMN "amountWithdrawn" SET DATA TYPE DECIMAL(25,2),
ALTER COLUMN "balance" SET NOT NULL,
ALTER COLUMN "balance" SET DEFAULT 0,
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(25,2);

-- AlterTable
ALTER TABLE "seller" ALTER COLUMN "totalEarning" SET NOT NULL,
ALTER COLUMN "totalEarning" SET DEFAULT 0,
ALTER COLUMN "totalEarning" SET DATA TYPE DECIMAL(25,2);

-- CreateTable
CREATE TABLE "Store" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "bankCode" TEXT,
    "currency" "Currency" NOT NULL DEFAULT 'NGN',
    "totalEarning" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "amountWithdrawn" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "sellerId" INTEGER NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_name_key" ON "Store"("name");

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
