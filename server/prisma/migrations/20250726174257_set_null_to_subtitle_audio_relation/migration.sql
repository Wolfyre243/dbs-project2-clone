-- DropForeignKey
ALTER TABLE "subtitle" DROP CONSTRAINT "subtitle_audio_id_fkey";

-- AddForeignKey
ALTER TABLE "subtitle" ADD CONSTRAINT "subtitle_audio_id_fkey" FOREIGN KEY ("audio_id") REFERENCES "audio"("audio_id") ON DELETE SET NULL ON UPDATE CASCADE;
