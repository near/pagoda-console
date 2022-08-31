-- CreateEnum
CREATE TYPE "Net" AS ENUM ('MAINNET', 'TESTNET');

-- CreateTable
CREATE TABLE "apikey_endpoint_metrics_per_base_window" (
    "api_key_identifier" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "endpoint_method" TEXT NOT NULL,
    "endpoint_group" TEXT,
    "success_count" INTEGER,
    "error_count" INTEGER,
    "min_latency" INTEGER,
    "max_latency" INTEGER,
    "mean_latency" DOUBLE PRECISION,
    "window_start_epoch_ms" BIGINT NOT NULL,
    "window_end_epoch_ms" BIGINT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "hour24" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,
    "quarter_minute" INTEGER NOT NULL,

    CONSTRAINT "apikey_endpoint_metrics_per_base_window_pkey" PRIMARY KEY ("api_key_identifier","network","endpoint_method","year","month","day","hour24","minute","quarter_minute")
);

-- CreateTable
CREATE TABLE "apikey_geography_metrics_per_base_window" (
    "api_key_identifier" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "success_count" INTEGER,
    "error_count" INTEGER,
    "min_latency" INTEGER,
    "max_latency" INTEGER,
    "mean_latency" DOUBLE PRECISION,
    "window_start_epoch_ms" BIGINT NOT NULL,
    "window_end_epoch_ms" BIGINT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "hour24" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,
    "quarter_minute" INTEGER NOT NULL,

    CONSTRAINT "apikey_geography_metrics_per_base_window_pkey" PRIMARY KEY ("api_key_identifier","network","country","state","year","month","day","hour24","minute","quarter_minute")
);
