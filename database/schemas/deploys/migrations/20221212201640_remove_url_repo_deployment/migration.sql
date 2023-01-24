/*
  Warnings:

  - You are about to drop the column `frontendDeployUrl` on the `RepoDeployment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RepoDeployment" DROP COLUMN "frontendDeployUrl";
