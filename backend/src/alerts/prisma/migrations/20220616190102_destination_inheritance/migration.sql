/*
  Warnings:

  - You are about to drop the column `name` on the `WebhookDestination` table. All the data in the column will be lost.
  - You are about to drop the column `projectSlug` on the `WebhookDestination` table. All the data in the column will be lost.
  - You are about to drop the `WebhookDelivery` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[destinationId]` on the table `WebhookDestination` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `destinationId` to the `WebhookDestination` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DestinationType" AS ENUM ('WEBHOOK');

-- DropForeignKey
ALTER TABLE "WebhookDelivery" DROP CONSTRAINT "WebhookDelivery_alertId_fkey";

-- DropForeignKey
ALTER TABLE "WebhookDelivery" DROP CONSTRAINT "WebhookDelivery_webhookDestinationId_fkey";

-- AlterTable
ALTER TABLE "WebhookDestination" DROP COLUMN "name",
DROP COLUMN "projectSlug",
ADD COLUMN     "destinationId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "WebhookDelivery";

-- CreateTable
CREATE TABLE "EnabledDestination" (
    "id" SERIAL NOT NULL,
    "alertId" INTEGER NOT NULL,
    "destinationId" INTEGER NOT NULL,
    "webhookDestinationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,

    CONSTRAINT "EnabledDestination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "projectSlug" TEXT NOT NULL,
    "type" "DestinationType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnabledDestination_destinationId_alertId_key" ON "EnabledDestination"("destinationId", "alertId");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookDestination_destinationId_key" ON "WebhookDestination"("destinationId");

-- AddForeignKey
ALTER TABLE "EnabledDestination" ADD CONSTRAINT "EnabledDestination_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alert_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnabledDestination" ADD CONSTRAINT "EnabledDestination_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnabledDestination" ADD CONSTRAINT "EnabledDestination_webhookDestinationId_fkey" FOREIGN KEY ("webhookDestinationId") REFERENCES "WebhookDestination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDestination" ADD CONSTRAINT "WebhookDestination_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
