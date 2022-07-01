-- AlterTable
ALTER TABLE "email_destinations" ALTER COLUMN "token" DROP NOT NULL,
ALTER COLUMN "token_expires_at" DROP NOT NULL;
