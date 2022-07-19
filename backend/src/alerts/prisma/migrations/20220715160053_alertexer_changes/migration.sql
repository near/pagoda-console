/*
  Warnings:

  - You are about to drop the column `triggered_alert_slug` on the `triggered_alerts` table. All the data in the column will be lost.
  - The primary key for the `triggered_alerts_destinations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `triggeredAlertId` on the `triggered_alerts_destinations` table. All the data in the column will be lost.
  - Added the required column `triggered_alert_id` to the `triggered_alerts_destinations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "triggered_alerts_destinations" DROP CONSTRAINT "triggered_alerts_destinations_triggeredAlertId_fkey";

-- AlterTable
ALTER TABLE "triggered_alerts" DROP COLUMN "triggered_alert_slug",
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "triggered_in_receipt_id" SET DATA TYPE TEXT,
ALTER COLUMN "triggered_at" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "triggered_alerts_destinations" DROP CONSTRAINT "triggered_alerts_destinations_pkey",
DROP COLUMN "triggeredAlertId",
ADD COLUMN     "triggered_alert_id" INTEGER NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ,
ADD CONSTRAINT "triggered_alerts_destinations_pkey" PRIMARY KEY ("triggered_alert_id", "alert_id", "destination_id");

-- AddForeignKey
ALTER TABLE "triggered_alerts_destinations" ADD CONSTRAINT "triggered_alerts_destinations_triggered_alert_id_fkey" FOREIGN KEY ("triggered_alert_id") REFERENCES "triggered_alerts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
