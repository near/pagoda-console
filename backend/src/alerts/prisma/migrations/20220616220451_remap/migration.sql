/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Destination` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Destination` table. All the data in the column will be lost.
  - You are about to drop the column `projectSlug` on the `Destination` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Destination` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `Destination` table. All the data in the column will be lost.
  - You are about to drop the column `alertId` on the `EnabledDestination` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `EnabledDestination` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `EnabledDestination` table. All the data in the column will be lost.
  - You are about to drop the column `destinationId` on the `EnabledDestination` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `EnabledDestination` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `EnabledDestination` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `WebhookDestination` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `WebhookDestination` table. All the data in the column will be lost.
  - You are about to drop the column `destinationId` on the `WebhookDestination` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `WebhookDestination` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `WebhookDestination` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[destination_id,alert_id]` on the table `EnabledDestination` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[destination_id]` on the table `WebhookDestination` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `project_slug` to the `Destination` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Destination` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `alert_id` to the `EnabledDestination` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destination_id` to the `EnabledDestination` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destination_id` to the `WebhookDestination` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "destination_type" AS ENUM ('WEBHOOK');

-- DropForeignKey
ALTER TABLE "EnabledDestination" DROP CONSTRAINT "EnabledDestination_alertId_fkey";

-- DropForeignKey
ALTER TABLE "EnabledDestination" DROP CONSTRAINT "EnabledDestination_destinationId_fkey";

-- DropForeignKey
ALTER TABLE "WebhookDestination" DROP CONSTRAINT "WebhookDestination_destinationId_fkey";

-- DropIndex
DROP INDEX "EnabledDestination_destinationId_alertId_key";

-- DropIndex
DROP INDEX "WebhookDestination_destinationId_key";

-- AlterTable
ALTER TABLE "Destination" DROP COLUMN "createdAt",
DROP COLUMN "createdBy",
DROP COLUMN "projectSlug",
DROP COLUMN "updatedAt",
DROP COLUMN "updatedBy",
ADD COLUMN     "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" INTEGER,
ADD COLUMN     "project_slug" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "updated_by" INTEGER,
DROP COLUMN "type",
ADD COLUMN     "type" "destination_type" NOT NULL;

-- AlterTable
ALTER TABLE "EnabledDestination" DROP COLUMN "alertId",
DROP COLUMN "createdAt",
DROP COLUMN "createdBy",
DROP COLUMN "destinationId",
DROP COLUMN "updatedAt",
DROP COLUMN "updatedBy",
ADD COLUMN     "alert_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" INTEGER,
ADD COLUMN     "destination_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "updated_by" INTEGER;

-- AlterTable
ALTER TABLE "WebhookDestination" DROP COLUMN "createdAt",
DROP COLUMN "createdBy",
DROP COLUMN "destinationId",
DROP COLUMN "updatedAt",
DROP COLUMN "updatedBy",
ADD COLUMN     "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" INTEGER,
ADD COLUMN     "destination_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "updated_by" INTEGER;

-- DropEnum
DROP TYPE "DestinationType";

-- CreateIndex
CREATE UNIQUE INDEX "EnabledDestination_destination_id_alert_id_key" ON "EnabledDestination"("destination_id", "alert_id");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookDestination_destination_id_key" ON "WebhookDestination"("destination_id");

-- AddForeignKey
ALTER TABLE "EnabledDestination" ADD CONSTRAINT "EnabledDestination_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alert_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnabledDestination" ADD CONSTRAINT "EnabledDestination_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDestination" ADD CONSTRAINT "WebhookDestination_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
