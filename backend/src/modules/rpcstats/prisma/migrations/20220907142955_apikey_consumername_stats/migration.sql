/*
  Warnings:

  - The primary key for the `apikey_endpoint_metrics_per_base_window` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `apikey_geography_metrics_per_base_window` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `api_key_consumer_id` to the `apikey_endpoint_metrics_per_base_window` table without a default value. This is not possible if the table is not empty.
  - Added the required column `api_key_consumer_name` to the `apikey_endpoint_metrics_per_base_window` table without a default value. This is not possible if the table is not empty.
  - Added the required column `api_key_org_slug` to the `apikey_endpoint_metrics_per_base_window` table without a default value. This is not possible if the table is not empty.
  - Added the required column `api_key_consumer_id` to the `apikey_geography_metrics_per_base_window` table without a default value. This is not possible if the table is not empty.
  - Added the required column `api_key_consumer_name` to the `apikey_geography_metrics_per_base_window` table without a default value. This is not possible if the table is not empty.
  - Added the required column `api_key_org_slug` to the `apikey_geography_metrics_per_base_window` table without a default value. This is not possible if the table is not empty.

*/

-- Clear data that does not have required consumer/org fields
TRUNCATE TABLE apikey_endpoint_metrics_per_base_window;

-- AlterTable
ALTER TABLE "apikey_endpoint_metrics_per_base_window" DROP CONSTRAINT "apikey_endpoint_metrics_per_base_window_pkey",
ADD COLUMN     "api_key_consumer_id" TEXT NOT NULL,
ADD COLUMN     "api_key_consumer_name" TEXT NOT NULL,
ADD COLUMN     "api_key_org_slug" TEXT NOT NULL,
ADD CONSTRAINT "apikey_endpoint_metrics_per_base_window_pkey" PRIMARY KEY ("api_key_identifier", "api_key_consumer_name", "api_key_org_slug", "api_key_consumer_id", "network", "endpoint_method", "year", "month", "day", "hour24", "minute", "quarter_minute");

-- AlterTable
ALTER TABLE "apikey_geography_metrics_per_base_window" DROP CONSTRAINT "apikey_geography_metrics_per_base_window_pkey",
ADD COLUMN     "api_key_consumer_id" TEXT NOT NULL,
ADD COLUMN     "api_key_consumer_name" TEXT NOT NULL,
ADD COLUMN     "api_key_org_slug" TEXT NOT NULL,
ADD CONSTRAINT "apikey_geography_metrics_per_base_window_pkey" PRIMARY KEY ("api_key_identifier", "api_key_consumer_name", "api_key_org_slug", "api_key_consumer_id", "network", "country", "state", "year", "month", "day", "hour24", "minute", "quarter_minute");
