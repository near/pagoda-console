-- CreateTable
CREATE TABLE "Abi" (
    "id" SERIAL NOT NULL,
    "contractSlug" TEXT NOT NULL,
    "abi" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,

    CONSTRAINT "Abi_pkey" PRIMARY KEY ("id")
);
