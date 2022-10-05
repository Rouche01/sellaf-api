-- CreateTable
CREATE TABLE "confirmation_token" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "confirmation_token_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "confirmation_token" ADD CONSTRAINT "confirmation_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
