-- AlterTable
ALTER TABLE "email_destinations" ADD COLUMN     "unsubscribe_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "email_destinations_unsubscribe_token_key" ON "email_destinations"("unsubscribe_token");
