/*
  Warnings:

  - You are about to drop the column `audio_id` on the `exhibit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "exhibit" DROP CONSTRAINT "exhibit_audio_id_fkey";

-- DropIndex
DROP INDEX "exhibit_status_id_audio_id_image_id_idx";

-- AlterTable
ALTER TABLE "exhibit" DROP COLUMN "audio_id";

-- CreateIndex
CREATE INDEX "exhibit_status_id_image_id_idx" ON "exhibit"("status_id", "image_id");
