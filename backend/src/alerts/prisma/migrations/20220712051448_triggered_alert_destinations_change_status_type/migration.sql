/*
  Warnings:

  - Changed the type of `status` on the `triggered_alerts_destinations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "triggered_alerts_destinations" DROP COLUMN "status",
ADD COLUMN     "status" INTEGER NOT NULL;
