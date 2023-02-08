-- AlterTable
ALTER TABLE "subscription" ALTER COLUMN "endDate" SET DEFAULT NOW() + interval '1 year';
