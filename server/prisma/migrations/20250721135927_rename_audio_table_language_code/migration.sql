/*
  Warnings:

  - You are about to drop the column `language_id` on the `audio` table. All the data in the column will be lost.
  - Added the required column `language_code` to the `audio` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "audio" DROP CONSTRAINT "audio_language_id_fkey";

-- DropIndex
DROP INDEX "audio_status_id_language_id_idx";

-- AlterTable
ALTER TABLE "audio" DROP COLUMN "language_id",
ADD COLUMN     "language_code" VARCHAR(6) NOT NULL;

-- CreateIndex
CREATE INDEX "audio_status_id_language_code_idx" ON "audio"("status_id", "language_code");

-- AddForeignKey
ALTER TABLE "audio" ADD CONSTRAINT "audio_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "language"("language_code") ON DELETE RESTRICT ON UPDATE CASCADE;
