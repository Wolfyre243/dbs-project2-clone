/*
  Warnings:

  - You are about to drop the `exhibit_audio_relation` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[audio_id]` on the table `subtitle` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "exhibit_audio_relation" DROP CONSTRAINT "exhibit_audio_relation_audio_id_fkey";

-- DropForeignKey
ALTER TABLE "exhibit_audio_relation" DROP CONSTRAINT "exhibit_audio_relation_exhibit_id_fkey";

-- AlterTable
ALTER TABLE "subtitle" ADD COLUMN     "audio_id" UUID;

-- DropTable
DROP TABLE "exhibit_audio_relation";

-- CreateIndex
CREATE UNIQUE INDEX "subtitle_audio_id_key" ON "subtitle"("audio_id");

-- AddForeignKey
ALTER TABLE "subtitle" ADD CONSTRAINT "subtitle_audio_id_fkey" FOREIGN KEY ("audio_id") REFERENCES "audio"("audio_id") ON DELETE SET NULL ON UPDATE CASCADE;
