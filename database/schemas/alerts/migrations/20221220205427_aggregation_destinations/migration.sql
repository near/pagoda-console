-- AlterEnum
ALTER TYPE "destination_type" ADD VALUE 'AGGREGATION';

-- CreateTable
CREATE TABLE "aggregation_destinations" (
    "id" SERIAL NOT NULL,
    "destination_id" INTEGER NOT NULL,
    "contract_name" TEXT NOT NULL,
    "function_name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_at" TIMESTAMPTZ,
    "updated_by" INTEGER,

    CONSTRAINT "aggregation_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "aggregation_destinations_destination_id_key" ON "aggregation_destinations"("destination_id");

-- AddForeignKey
ALTER TABLE "aggregation_destinations" ADD CONSTRAINT "aggregation_destinations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
