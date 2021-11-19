/*
  Warnings:

  - A unique constraint covering the columns `[projectId,subId]` on the table `Environment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subId` to the `Environment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Environment" ADD COLUMN     "subId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Environment_projectId_subId_key" ON "Environment"("projectId", "subId");
