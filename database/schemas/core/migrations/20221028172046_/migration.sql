/*
  Warnings:

  - A unique constraint covering the columns `[name,orgSlug]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orgSlug,name]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `test` to the `Contract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "test" TEXT NOT NULL;
DROP INDEX IF EXISTS "Project_name_orgSlug_key";
DROP INDEX IF EXISTS "Team_orgSlug_name_key";
DROP INDEX IF EXISTS "User_email_key";