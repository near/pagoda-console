-- CreateEnum
CREATE TYPE "chain_id" AS ENUM ('MAINNET', 'TESTNET');

-- CreateEnum
CREATE TYPE "alert_rule_kind" AS ENUM ('ACTIONS', 'EVENTS', 'STATE_CHANGES');

-- CreateTable
CREATE TABLE "alert_rules" (
    "id" SERIAL NOT NULL,
    "alert_rule_kind" "alert_rule_kind" NOT NULL,
    "name" TEXT NOT NULL,
    "matching_rule" JSONB NOT NULL,
    "is_paused" BOOLEAN NOT NULL DEFAULT false,
    "project_slug" TEXT NOT NULL,
    "environment_sub_id" INTEGER NOT NULL,
    "chain_id" "chain_id" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3),
    "updated_by" INTEGER,

    CONSTRAINT "alert_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" SERIAL NOT NULL,
    "alertId" INTEGER NOT NULL,
    "webhookDestinationId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookDestination" (
    "id" SERIAL NOT NULL,
    "projectSlug" TEXT NOT NULL,
    "name" TEXT,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,

    CONSTRAINT "WebhookDestination_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alert_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_webhookDestinationId_fkey" FOREIGN KEY ("webhookDestinationId") REFERENCES "WebhookDestination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
