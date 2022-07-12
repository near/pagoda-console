-- CreateTable
CREATE TABLE "triggered_alerts" (
    "id" SERIAL NOT NULL,
    "alert_id" INTEGER NOT NULL,
    "triggered_in_block_hash" TEXT NOT NULL,
    "triggered_in_transaction_hash" TEXT,
    "triggered_in_receipt_id" INTEGER,
    "triggered_at" TIMESTAMP(3) NOT NULL,
    "extra_data" JSONB,

    CONSTRAINT "triggered_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "triggered_alerts_destinations" (
    "triggeredAlertId" INTEGER NOT NULL,
    "alert_id" INTEGER NOT NULL,
    "destination_id" INTEGER NOT NULL,
    "status" "destination_type" NOT NULL,
    "response" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "triggered_alerts_destinations_pkey" PRIMARY KEY ("triggeredAlertId","alert_id","destination_id")
);

-- AddForeignKey
ALTER TABLE "triggered_alerts" ADD CONSTRAINT "triggered_alerts_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alert_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triggered_alerts_destinations" ADD CONSTRAINT "triggered_alerts_destinations_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alert_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triggered_alerts_destinations" ADD CONSTRAINT "triggered_alerts_destinations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triggered_alerts_destinations" ADD CONSTRAINT "triggered_alerts_destinations_triggeredAlertId_fkey" FOREIGN KEY ("triggeredAlertId") REFERENCES "triggered_alerts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
