-- DropForeignKey
ALTER TABLE "exhibit_subtitle" DROP CONSTRAINT "exhibit_subtitle_exhibit_id_fkey";

-- DropForeignKey
ALTER TABLE "exhibit_subtitle" DROP CONSTRAINT "exhibit_subtitle_subtitle_id_fkey";

-- DropForeignKey
ALTER TABLE "subtitle" DROP CONSTRAINT "subtitle_audio_id_fkey";

-- AddForeignKey
ALTER TABLE "subtitle" ADD CONSTRAINT "subtitle_audio_id_fkey" FOREIGN KEY ("audio_id") REFERENCES "audio"("audio_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibit_subtitle" ADD CONSTRAINT "exhibit_subtitle_exhibit_id_fkey" FOREIGN KEY ("exhibit_id") REFERENCES "exhibit"("exhibit_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibit_subtitle" ADD CONSTRAINT "exhibit_subtitle_subtitle_id_fkey" FOREIGN KEY ("subtitle_id") REFERENCES "subtitle"("subtitle_id") ON DELETE CASCADE ON UPDATE CASCADE;
