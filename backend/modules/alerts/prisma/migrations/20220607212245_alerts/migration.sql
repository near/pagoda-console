-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('TX_SUCCESS', 'TX_FAILURE', 'FN_CALL', 'EVENT', 'ACCT_BAL_PCT', 'ACCT_BAL_NUM');

-- CreateEnum
CREATE TYPE "TxAction" AS ENUM ('CREATE_ACCOUNT', 'DEPLOY_CONTRACT', 'FUNCTION_CALL', 'TRANSFER', 'STAKE', 'ADD_KEY', 'DELETE_KEY', 'DELETE_ACCOUNT');

-- CreateEnum
CREATE TYPE "NumberComparator" AS ENUM ('EQ', 'NEQ', 'LT', 'LTE', 'GT', 'GTE');

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "type" "RuleType" NOT NULL,
    "name" TEXT NOT NULL,
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "contractId" INTEGER NOT NULL,
    "environmentId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FnCallRule" (
    "id" SERIAL NOT NULL,
    "function" TEXT NOT NULL,
    "params" JSONB NOT NULL,
    "alertId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,

    CONSTRAINT "FnCallRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TxRule" (
    "id" SERIAL NOT NULL,
    "action" "TxAction",
    "alertId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,

    CONSTRAINT "TxRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRule" (
    "id" SERIAL NOT NULL,
    "standard" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "alertId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,

    CONSTRAINT "EventRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcctBalRule" (
    "id" SERIAL NOT NULL,
    "comparator" "NumberComparator" NOT NULL,
    "amount" INTEGER NOT NULL,
    "alertId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,

    CONSTRAINT "AcctBalRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FnCallRule_alertId_key" ON "FnCallRule"("alertId");

-- CreateIndex
CREATE UNIQUE INDEX "TxRule_alertId_key" ON "TxRule"("alertId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRule_alertId_key" ON "EventRule"("alertId");

-- CreateIndex
CREATE UNIQUE INDEX "AcctBalRule_alertId_key" ON "AcctBalRule"("alertId");

-- AddForeignKey
ALTER TABLE "FnCallRule" ADD CONSTRAINT "FnCallRule_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TxRule" ADD CONSTRAINT "TxRule_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRule" ADD CONSTRAINT "EventRule_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcctBalRule" ADD CONSTRAINT "AcctBalRule_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
