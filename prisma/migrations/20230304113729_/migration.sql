-- CreateTable
CREATE TABLE "Transaction" (
    "signature" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("signature")
);
