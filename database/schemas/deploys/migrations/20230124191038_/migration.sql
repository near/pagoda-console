-- CreateEnum
CREATE TYPE "ContractDeployStatus" AS ENUM ('IN_PROGRESS', 'SUCCESS', 'ERROR');

-- AlterTable
ALTER TABLE "ContractDeployment" ADD COLUMN     "status" "ContractDeployStatus" NOT NULL DEFAULT E'IN_PROGRESS';
