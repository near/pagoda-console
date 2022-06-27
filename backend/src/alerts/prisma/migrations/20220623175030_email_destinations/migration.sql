-- AlterEnum
ALTER TYPE "destination_type" ADD VALUE 'EMAIL';

-- AlterTable
ALTER TABLE "destinations" RENAME CONSTRAINT "Destination_pkey" TO "destinations_pkey";
ALTER TABLE "destinations" ADD COLUMN "is_valid" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "enabled_destinations" RENAME CONSTRAINT "EnabledDestination_pkey" TO "enabled_destinations_pkey";

-- AlterTable
ALTER TABLE "webhook_destinations" RENAME CONSTRAINT "WebhookDestination_pkey" TO "webhook_destinations_pkey";

-- CreateTable
CREATE TABLE "email_destinations" (
    "id" SERIAL NOT NULL,
    "destination_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "token_expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_at" TIMESTAMP(3),
    "updated_by" INTEGER,

    CONSTRAINT "email_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_destinations_destination_id_key" ON "email_destinations"("destination_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_destinations_token_key" ON "email_destinations"("token");

-- RenameForeignKey
ALTER TABLE "enabled_destinations" RENAME CONSTRAINT "EnabledDestination_alert_id_fkey" TO "enabled_destinations_alert_id_fkey";

-- RenameForeignKey
ALTER TABLE "enabled_destinations" RENAME CONSTRAINT "EnabledDestination_destination_id_fkey" TO "enabled_destinations_destination_id_fkey";

-- RenameForeignKey
ALTER TABLE "webhook_destinations" RENAME CONSTRAINT "WebhookDestination_destination_id_fkey" TO "webhook_destinations_destination_id_fkey";

-- AddForeignKey
ALTER TABLE "email_destinations" ADD CONSTRAINT "email_destinations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "EnabledDestination_destination_id_alert_id_key" RENAME TO "enabled_destinations_destination_id_alert_id_key";

-- RenameIndex
ALTER INDEX "WebhookDestination_destination_id_key" RENAME TO "webhook_destinations_destination_id_key";
