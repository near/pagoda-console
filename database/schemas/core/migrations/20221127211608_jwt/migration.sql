-- CreateEnum
CREATE TYPE "KeyType" AS ENUM ('JWT', 'KEY');
-- AlterTable
ALTER TABLE "ApiKey"
ADD COLUMN "type" "KeyType" NOT NULL DEFAULT 'KEY';
-- Default is no longer needed after intial creation.
ALTER TABLE "ApiKey"
ALTER COLUMN "type" DROP DEFAULT;