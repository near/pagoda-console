/*
  Warnings:

  - A unique constraint covering the columns `[githubRepoFullName]` on the table `Repository` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authTokenHash` to the `Repository` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authTokenSalt` to the `Repository` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Repository" ADD COLUMN     "authTokenHash" BYTEA NOT NULL,
ADD COLUMN     "authTokenSalt" BYTEA NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Repository_githubRepoFullName_key" ON "Repository"("githubRepoFullName");
