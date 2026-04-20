-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ItemType" ADD VALUE 'SYLLABUS_LANGUAGE';
ALTER TYPE "ItemType" ADD VALUE 'TEMPLATE';
ALTER TYPE "ItemType" ADD VALUE 'CASE_STUDY';

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "lastReviewedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isCtlStaff" BOOLEAN NOT NULL DEFAULT false;
