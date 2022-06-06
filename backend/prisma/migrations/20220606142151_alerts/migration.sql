/*
  Warnings:

  - You are about to drop the `Audit` table. If the table is not empty, all the data it contains will be lost.

*/
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
    "description" TEXT NOT NULL,
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "fnCallRuleId" INTEGER,
    "txRuleId" INTEGER,
    "acctBalRuleId" INTEGER,
    "eventRuleId" INTEGER,
    "contractId" INTEGER NOT NULL,
    "environmentId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FnCallRule" (
    "id" SERIAL NOT NULL,
    "function" TEXT NOT NULL,
    "params" JSONB NOT NULL,
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
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,

    CONSTRAINT "AcctBalRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Alert_fnCallRuleId_key" ON "Alert"("fnCallRuleId");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_txRuleId_key" ON "Alert"("txRuleId");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_acctBalRuleId_key" ON "Alert"("acctBalRuleId");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_eventRuleId_key" ON "Alert"("eventRuleId");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_fnCallRuleId_fkey" FOREIGN KEY ("fnCallRuleId") REFERENCES "FnCallRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_txRuleId_fkey" FOREIGN KEY ("txRuleId") REFERENCES "TxRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_eventRuleId_fkey" FOREIGN KEY ("eventRuleId") REFERENCES "EventRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_acctBalRuleId_fkey" FOREIGN KEY ("acctBalRuleId") REFERENCES "AcctBalRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FnCallRule" ADD CONSTRAINT "FnCallRule_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FnCallRule" ADD CONSTRAINT "FnCallRule_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TxRule" ADD CONSTRAINT "TxRule_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TxRule" ADD CONSTRAINT "TxRule_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRule" ADD CONSTRAINT "EventRule_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRule" ADD CONSTRAINT "EventRule_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcctBalRule" ADD CONSTRAINT "AcctBalRule_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcctBalRule" ADD CONSTRAINT "AcctBalRule_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
