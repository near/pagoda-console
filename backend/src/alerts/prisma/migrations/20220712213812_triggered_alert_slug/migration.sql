/*
  Warnings:

  - Added the required column `triggered_alert_slug` to the `triggered_alerts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "triggered_alerts" ADD COLUMN     "triggered_alert_slug" TEXT NOT NULL;
