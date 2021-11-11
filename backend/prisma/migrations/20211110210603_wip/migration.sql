-- AlterTable
ALTER TABLE "ApiKey" ALTER COLUMN "active" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "active" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "active" SET DEFAULT true;

-- AlterTable
ALTER TABLE "TeamMember" ALTER COLUMN "active" SET DEFAULT true;

-- AlterTable
ALTER TABLE "TeamProject" ALTER COLUMN "active" SET DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "photoUrl" TEXT,
ALTER COLUMN "active" SET DEFAULT true;
