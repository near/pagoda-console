/*
  Warnings:

  - The primary key for the `ApiKey` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `environmentId` on the `ApiKey` table. All the data in the column will be lost.
  - You are about to drop the column `net` on the `ApiKey` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `ApiKey` table. All the data in the column will be lost.
  - You are about to drop the `Audit` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `ApiKey` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emsId]` on the table `Org` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,orgSlug]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orgSlug,name]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `ApiKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgSlug` to the `ApiKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectSlug` to the `ApiKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `ApiKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emsId` to the `Org` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_environmentId_fkey";

-- AlterTable
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_pkey",
DROP COLUMN "environmentId",
DROP COLUMN "net",
DROP COLUMN "reference",
ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "orgSlug" TEXT NOT NULL,
ADD COLUMN     "projectSlug" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "updatedBy" INTEGER,
ADD CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Org" ADD COLUMN "emsId" TEXT;

-- Backfilling emsId for existing personal orgs
UPDATE "Org" SET "emsId"=nanoid(20, '0123456789abcdefghijklmnopqrstuvwxyz') WHERE "emsId" IS NULL;

-- Setting not null constraint after backfilling
ALTER TABLE "Org" ALTER COLUMN "emsId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_slug_key" ON "ApiKey"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Org_emsId_key" ON "Org"("emsId");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
