-- Add ctlCurated field
ALTER TABLE "Item" ADD COLUMN "ctlCurated" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: all existing guidance-type items are considered CTL Curated,
-- preserving the badge that was previously derived from item type.
UPDATE "Item"
SET "ctlCurated" = true
WHERE "type" IN ('SYLLABUS_LANGUAGE', 'TEMPLATE', 'CASE_STUDY', 'TOOLKIT');
