/*
  Warnings:

  - Added the required column `language_code` to the `audio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language_code` to the `subtitle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language_code` to the `user_profile` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "audio_status_id_idx";

-- DropIndex
DROP INDEX "language_status_id_idx";

-- DropIndex
DROP INDEX "subtitle_status_id_idx";

-- DropIndex
DROP INDEX "user_profile_status_id_idx";

-- AlterTable
ALTER TABLE "audio" ADD COLUMN     "language_code" VARCHAR(6) NOT NULL;

-- AlterTable
ALTER TABLE "subtitle" ADD COLUMN     "language_code" VARCHAR(6) NOT NULL;

-- AlterTable
ALTER TABLE "user_profile" ADD COLUMN     "language_code" VARCHAR(6) NOT NULL;

-- CreateIndex
CREATE INDEX "audio_status_id_language_code_idx" ON "audio"("status_id", "language_code");

-- CreateIndex
CREATE INDEX "language_status_id_language_code_idx" ON "language"("status_id", "language_code");

-- CreateIndex
CREATE INDEX "subtitle_status_id_language_code_idx" ON "subtitle"("status_id", "language_code");

-- CreateIndex
CREATE INDEX "user_profile_status_id_language_code_idx" ON "user_profile"("status_id", "language_code");

-- AddForeignKey
ALTER TABLE "audio" ADD CONSTRAINT "audio_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "language"("language_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "language"("language_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtitle" ADD CONSTRAINT "subtitle_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "language"("language_code") ON DELETE RESTRICT ON UPDATE CASCADE;
