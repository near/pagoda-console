-- CreateEnum
CREATE TYPE "ProjectTutorial" AS ENUM ('NFT_MARKET', 'CROSSWORD');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "tutorial" "ProjectTutorial";
