/*
  Warnings:

  - You are about to drop the column `active` on the `WebhookDestination` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WebhookDestination" DROP COLUMN "active";
