/*
  Warnings:

  - You are about to drop the column `status` on the `affiliate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "affiliate" DROP COLUMN "status",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "totalEarnings" SET DEFAULT 0,
ALTER COLUMN "amountWithdrawn" SET DEFAULT 0,
ALTER COLUMN "balance" SET DEFAULT 0;
