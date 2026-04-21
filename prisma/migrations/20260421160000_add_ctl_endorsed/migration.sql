-- Add ctlEndorsed field. No backfill: no community items are currently endorsed.
ALTER TABLE "Item" ADD COLUMN "ctlEndorsed" BOOLEAN NOT NULL DEFAULT false;
