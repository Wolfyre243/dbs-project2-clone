/*
  Warnings:

  - You are about to drop the column `language_code` on the `audio` table. All the data in the column will be lost.
  - The primary key for the `language` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `language_code` on the `subtitle` table. All the data in the column will be lost.
  - You are about to drop the column `language_code` on the `user_profile` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "audio" DROP CONSTRAINT "audio_language_code_fkey";

-- DropForeignKey
ALTER TABLE "subtitle" DROP CONSTRAINT "subtitle_language_code_fkey";

-- DropForeignKey
ALTER TABLE "user_profile" DROP CONSTRAINT "user_profile_language_code_fkey";

-- DropIndex
DROP INDEX "audio_status_id_language_code_idx";

-- DropIndex
DROP INDEX "subtitle_language_code_status_id_idx";

-- DropIndex
DROP INDEX "user_profile_language_code_status_id_idx";

-- AlterTable
ALTER TABLE "audio" DROP COLUMN "language_code";

-- AlterTable
ALTER TABLE "language" DROP CONSTRAINT "language_pkey",
ALTER COLUMN "language_code" SET DATA TYPE VARCHAR(6),
ADD CONSTRAINT "language_pkey" PRIMARY KEY ("language_code");

-- AlterTable
ALTER TABLE "subtitle" DROP COLUMN "language_code";

-- AlterTable
ALTER TABLE "user_profile" DROP COLUMN "language_code";

-- CreateIndex
CREATE INDEX "audio_status_id_idx" ON "audio"("status_id");

-- CreateIndex
CREATE INDEX "subtitle_status_id_idx" ON "subtitle"("status_id");

-- CreateIndex
CREATE INDEX "user_profile_status_id_idx" ON "user_profile"("status_id");
