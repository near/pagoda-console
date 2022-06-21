/*
  Warnings:

  - You are about to drop the column `webhookDestinationId` on the `EnabledDestination` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EnabledDestination" DROP CONSTRAINT "EnabledDestination_webhookDestinationId_fkey";

-- AlterTable
ALTER TABLE "EnabledDestination" DROP COLUMN "webhookDestinationId";
