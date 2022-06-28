-- AlterEnum
ALTER TYPE "destination_type" ADD VALUE 'TELEGRAM';

-- CreateTable
CREATE TABLE "telegram_destinations" (
    "id" SERIAL NOT NULL,
    "destination_id" INTEGER NOT NULL,
    "chat_id" DOUBLE PRECISION,
    "start_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_at" TIMESTAMP(3),
    "updated_by" INTEGER,

    CONSTRAINT "telegram_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_destinations_destination_id_key" ON "telegram_destinations"("destination_id");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_destinations_start_token_key" ON "telegram_destinations"("start_token");

-- AddForeignKey
ALTER TABLE "telegram_destinations" ADD CONSTRAINT "telegram_destinations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
