/*
  Warnings:

  - You are about to drop the column `file_name` on the `audio` table. All the data in the column will be lost.
  - You are about to drop the column `file_name` on the `image` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[file_link]` on the table `audio` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[file_link]` on the table `image` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `file_link` to the `audio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_link` to the `image` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "audio_file_name_key";

-- DropIndex
DROP INDEX "image_file_name_key";

-- AlterTable
ALTER TABLE "audio" DROP COLUMN "file_name",
ADD COLUMN     "file_link" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "image" DROP COLUMN "file_name",
ADD COLUMN     "file_link" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "audio_file_link_key" ON "audio"("file_link");

-- CreateIndex
CREATE UNIQUE INDEX "image_file_link_key" ON "image"("file_link");
