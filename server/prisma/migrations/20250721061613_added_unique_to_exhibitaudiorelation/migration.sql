/*
  Warnings:

  - A unique constraint covering the columns `[audio_id]` on the table `exhibit_audio_relation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "exhibit_audio_relation_audio_id_key" ON "exhibit_audio_relation"("audio_id");
