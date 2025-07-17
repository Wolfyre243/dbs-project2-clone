/*
  Warnings:

  - You are about to drop the column `status_code` on the `audio` table. All the data in the column will be lost.
  - You are about to drop the column `status_code` on the `email` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `email` table. All the data in the column will be lost.
  - You are about to drop the column `qr_code_id` on the `exhibit` table. All the data in the column will be lost.
  - You are about to drop the column `status_code` on the `exhibit` table. All the data in the column will be lost.
  - You are about to drop the column `status_code` on the `image` table. All the data in the column will be lost.
  - You are about to drop the column `status_code` on the `language` table. All the data in the column will be lost.
  - You are about to drop the column `status_code` on the `phone_number` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `phone_number` table. All the data in the column will be lost.
  - You are about to drop the column `qr_link` on the `qr_code` table. All the data in the column will be lost.
  - You are about to drop the column `status_code` on the `qr_code` table. All the data in the column will be lost.
  - You are about to drop the column `status_code` on the `role` table. All the data in the column will be lost.
  - The primary key for the `status` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `description` on the `status` table. All the data in the column will be lost.
  - You are about to drop the column `status_code` on the `status` table. All the data in the column will be lost.
  - You are about to drop the column `status_code` on the `subtitle` table. All the data in the column will be lost.
  - You are about to drop the column `status_code` on the `user_profile` table. All the data in the column will be lost.
  - You are about to drop the column `status_code` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `email` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `phone_number` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[exhibit_id]` on the table `qr_code` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[image_id]` on the table `qr_code` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `status_id` to the `audio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_id` to the `email` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_id` to the `exhibit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_id` to the `image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_id` to the `language` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_id` to the `phone_number` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exhibit_id` to the `qr_code` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_id` to the `qr_code` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_id` to the `qr_code` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_id` to the `role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_name` to the `status` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_id` to the `subtitle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_id` to the `user_profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "audio" DROP CONSTRAINT "audio_status_code_fkey";

-- DropForeignKey
ALTER TABLE "email" DROP CONSTRAINT "email_status_code_fkey";

-- DropForeignKey
ALTER TABLE "exhibit" DROP CONSTRAINT "exhibit_qr_code_id_fkey";

-- DropForeignKey
ALTER TABLE "exhibit" DROP CONSTRAINT "exhibit_status_code_fkey";

-- DropForeignKey
ALTER TABLE "image" DROP CONSTRAINT "image_status_code_fkey";

-- DropForeignKey
ALTER TABLE "language" DROP CONSTRAINT "language_status_code_fkey";

-- DropForeignKey
ALTER TABLE "phone_number" DROP CONSTRAINT "phone_number_status_code_fkey";

-- DropForeignKey
ALTER TABLE "qr_code" DROP CONSTRAINT "qr_code_status_code_fkey";

-- DropForeignKey
ALTER TABLE "role" DROP CONSTRAINT "role_status_code_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_user_id_fkey";

-- DropForeignKey
ALTER TABLE "subtitle" DROP CONSTRAINT "subtitle_status_code_fkey";

-- DropForeignKey
ALTER TABLE "user_profile" DROP CONSTRAINT "user_profile_status_code_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_status_code_fkey";

-- DropIndex
DROP INDEX "audio_language_id_idx";

-- DropIndex
DROP INDEX "audio_status_code_idx";

-- DropIndex
DROP INDEX "audit_log_action_type_idx";

-- DropIndex
DROP INDEX "audit_log_user_id_idx";

-- DropIndex
DROP INDEX "email_status_code_idx";

-- DropIndex
DROP INDEX "email_user_id_idx";

-- DropIndex
DROP INDEX "exhibit_audio_id_idx";

-- DropIndex
DROP INDEX "exhibit_image_id_idx";

-- DropIndex
DROP INDEX "exhibit_qr_code_id_idx";

-- DropIndex
DROP INDEX "exhibit_status_code_idx";

-- DropIndex
DROP INDEX "exhibit_subtitle_exhibit_id_idx";

-- DropIndex
DROP INDEX "exhibit_subtitle_subtitle_id_idx";

-- DropIndex
DROP INDEX "image_status_code_idx";

-- DropIndex
DROP INDEX "language_status_code_idx";

-- DropIndex
DROP INDEX "phone_number_status_code_idx";

-- DropIndex
DROP INDEX "phone_number_user_id_idx";

-- DropIndex
DROP INDEX "qr_code_status_code_idx";

-- DropIndex
DROP INDEX "role_status_code_idx";

-- DropIndex
DROP INDEX "subtitle_language_code_idx";

-- DropIndex
DROP INDEX "subtitle_status_code_idx";

-- DropIndex
DROP INDEX "user_profile_language_code_idx";

-- DropIndex
DROP INDEX "user_profile_status_code_idx";

-- DropIndex
DROP INDEX "user_role_role_id_idx";

-- DropIndex
DROP INDEX "user_role_user_id_idx";

-- DropIndex
DROP INDEX "users_status_code_idx";

-- AlterTable
ALTER TABLE "audio" DROP COLUMN "status_code",
ADD COLUMN     "status_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "email" DROP COLUMN "status_code",
DROP COLUMN "verified",
ADD COLUMN     "status_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "exhibit" DROP COLUMN "qr_code_id",
DROP COLUMN "status_code",
ADD COLUMN     "status_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "image" DROP COLUMN "status_code",
ADD COLUMN     "status_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "language" DROP COLUMN "status_code",
ADD COLUMN     "status_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "phone_number" DROP COLUMN "status_code",
DROP COLUMN "verified",
ADD COLUMN     "status_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "qr_code" DROP COLUMN "qr_link",
DROP COLUMN "status_code",
ADD COLUMN     "exhibit_id" UUID NOT NULL,
ADD COLUMN     "image_id" UUID NOT NULL,
ADD COLUMN     "status_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "role" DROP COLUMN "status_code",
ADD COLUMN     "status_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "status" DROP CONSTRAINT "status_pkey",
DROP COLUMN "description",
DROP COLUMN "status_code",
ADD COLUMN     "status_id" SERIAL NOT NULL,
ADD COLUMN     "status_name" VARCHAR(30) NOT NULL,
ADD CONSTRAINT "status_pkey" PRIMARY KEY ("status_id");

-- AlterTable
ALTER TABLE "subtitle" DROP COLUMN "status_code",
ADD COLUMN     "status_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user_profile" DROP COLUMN "status_code",
ADD COLUMN     "status_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "status_code",
ADD COLUMN     "status_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "audio_status_id_language_id_idx" ON "audio"("status_id", "language_id");

-- CreateIndex
CREATE INDEX "audit_log_user_id_action_type_idx" ON "audit_log"("user_id", "action_type");

-- CreateIndex
CREATE UNIQUE INDEX "email_user_id_key" ON "email"("user_id");

-- CreateIndex
CREATE INDEX "email_user_id_status_id_idx" ON "email"("user_id", "status_id");

-- CreateIndex
CREATE INDEX "exhibit_status_id_audio_id_image_id_idx" ON "exhibit"("status_id", "audio_id", "image_id");

-- CreateIndex
CREATE INDEX "exhibit_subtitle_exhibit_id_subtitle_id_idx" ON "exhibit_subtitle"("exhibit_id", "subtitle_id");

-- CreateIndex
CREATE INDEX "image_status_id_idx" ON "image"("status_id");

-- CreateIndex
CREATE INDEX "language_status_id_idx" ON "language"("status_id");

-- CreateIndex
CREATE UNIQUE INDEX "phone_number_user_id_key" ON "phone_number"("user_id");

-- CreateIndex
CREATE INDEX "phone_number_user_id_status_id_idx" ON "phone_number"("user_id", "status_id");

-- CreateIndex
CREATE UNIQUE INDEX "qr_code_exhibit_id_key" ON "qr_code"("exhibit_id");

-- CreateIndex
CREATE UNIQUE INDEX "qr_code_image_id_key" ON "qr_code"("image_id");

-- CreateIndex
CREATE INDEX "qr_code_status_id_idx" ON "qr_code"("status_id");

-- CreateIndex
CREATE INDEX "role_status_id_idx" ON "role"("status_id");

-- CreateIndex
CREATE INDEX "subtitle_language_code_status_id_idx" ON "subtitle"("language_code", "status_id");

-- CreateIndex
CREATE INDEX "user_profile_language_code_status_id_idx" ON "user_profile"("language_code", "status_id");

-- CreateIndex
CREATE INDEX "user_role_user_id_role_id_idx" ON "user_role"("user_id", "role_id");

-- CreateIndex
CREATE INDEX "users_status_id_idx" ON "users"("status_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio" ADD CONSTRAINT "audio_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibit" ADD CONSTRAINT "exhibit_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_number" ADD CONSTRAINT "phone_number_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email" ADD CONSTRAINT "email_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_code" ADD CONSTRAINT "qr_code_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_code" ADD CONSTRAINT "qr_code_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "image"("image_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_code" ADD CONSTRAINT "qr_code_exhibit_id_fkey" FOREIGN KEY ("exhibit_id") REFERENCES "exhibit"("exhibit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "language" ADD CONSTRAINT "language_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtitle" ADD CONSTRAINT "subtitle_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;
