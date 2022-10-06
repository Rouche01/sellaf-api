/*
  Warnings:

  - Made the column `firstName` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "username" TEXT NOT NULL DEFAULT 'richard.emate-3hft',
ALTER COLUMN "firstName" SET NOT NULL;
