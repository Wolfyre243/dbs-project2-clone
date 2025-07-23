/*
  Warnings:

  - A unique constraint covering the columns `[file_name]` on the table `audio` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[file_name]` on the table `image` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `file_name` to the `audio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_name` to the `image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "audio" ADD COLUMN     "file_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "image" ADD COLUMN     "file_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "audio_file_name_key" ON "audio"("file_name");

-- CreateIndex
CREATE UNIQUE INDEX "image_file_name_key" ON "image"("file_name");
