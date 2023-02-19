/*
  Warnings:

  - You are about to drop the column `coinbaseRef` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `flutterwaveRef` on the `transaction` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentProcessor" AS ENUM ('FLUTTERWAVE', 'COINBASE');

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "coinbaseRef",
DROP COLUMN "flutterwaveRef";

-- CreateTable
CREATE TABLE "payment_processor_reference" (
    "trxId" TEXT NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "type" "PaymentProcessor" NOT NULL,
    "transactionId" INTEGER NOT NULL,

    CONSTRAINT "payment_processor_reference_pkey" PRIMARY KEY ("trxId")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_processor_reference_transactionId_key" ON "payment_processor_reference"("transactionId");

-- AddForeignKey
ALTER TABLE "payment_processor_reference" ADD CONSTRAINT "payment_processor_reference_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
