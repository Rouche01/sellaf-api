/*
  Warnings:

  - The primary key for the `payment_processor_reference` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "payment_processor_reference" DROP CONSTRAINT "payment_processor_reference_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "trxId" DROP NOT NULL,
ALTER COLUMN "referenceCode" DROP NOT NULL,
ADD CONSTRAINT "payment_processor_reference_pkey" PRIMARY KEY ("id");
