/*
  Warnings:

  - You are about to drop the column `url` on the `FrontendDeployConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FrontendDeployConfig" DROP COLUMN "url";

-- AlterTable
ALTER TABLE "FrontendDeployment" ADD COLUMN     "cid" TEXT,
ADD COLUMN     "url" TEXT;
