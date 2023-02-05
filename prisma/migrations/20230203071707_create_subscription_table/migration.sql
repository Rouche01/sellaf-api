-- CreateTable
CREATE TABLE "subscription" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL,
    "willRenew" BOOLEAN NOT NULL DEFAULT false,
    "affiliateId" INTEGER NOT NULL,
    "transactionId" INTEGER,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_affiliateId_key" ON "subscription"("affiliateId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_transactionId_key" ON "subscription"("transactionId");

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
