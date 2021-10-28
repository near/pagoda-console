/*
  Warnings:

  - Added the required column `net` to the `Dapp` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Net" AS ENUM ('MAIN', 'TEST');

-- AlterTable
ALTER TABLE "Dapp" ADD COLUMN     "net" "Net" NOT NULL;
