/*
  Warnings:

  - Added the required column `updatedAt` to the `confirmation_token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "confirmation_token" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
