/*
  Warnings:

  - Added the required column `active` to the `Contract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "active" BOOLEAN NOT NULL;
