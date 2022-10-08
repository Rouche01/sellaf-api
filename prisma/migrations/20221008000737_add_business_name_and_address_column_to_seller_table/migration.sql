/*
  Warnings:

  - Added the required column `address` to the `seller` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessName` to the `seller` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "seller" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "businessName" TEXT NOT NULL;
