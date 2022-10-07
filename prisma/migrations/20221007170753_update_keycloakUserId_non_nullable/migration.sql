/*
  Warnings:

  - Made the column `keycloakUserId` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user" ALTER COLUMN "keycloakUserId" SET NOT NULL;
