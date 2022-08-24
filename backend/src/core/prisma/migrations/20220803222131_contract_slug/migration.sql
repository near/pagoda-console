-- AlterTable
ALTER TABLE "Contract" ADD COLUMN "slug" TEXT;

-- Backfill previous values since this is a new column and we don't want it to be null.
UPDATE "Contract" SET "slug" = nanoid(13, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz') WHERE "slug" is null;

-- Require slug to be set.
ALTER TABLE "Contract" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Contract_slug_key" ON "Contract"("slug");