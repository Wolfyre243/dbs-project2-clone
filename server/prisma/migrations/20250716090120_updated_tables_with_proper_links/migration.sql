/*
  Warnings:

  - You are about to drop the column `file_url` on the `audio` table. All the data in the column will be lost.
  - You are about to drop the column `new_value` on the `audit_log` table. All the data in the column will be lost.
  - You are about to drop the column `old_value` on the `audit_log` table. All the data in the column will be lost.
  - You are about to drop the column `status_code` on the `audit_log` table. All the data in the column will be lost.
  - You are about to drop the column `session_id` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `usersUserId` on the `event` table. All the data in the column will be lost.
  - You are about to drop the `phoneNumber` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `qrCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userProfile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `user_role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `log_text` to the `audit_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `details` to the `event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "audit_log" DROP CONSTRAINT "audit_log_status_code_fkey";

-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_session_id_fkey";

-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_usersUserId_fkey";

-- DropForeignKey
ALTER TABLE "exhibit" DROP CONSTRAINT "exhibit_qr_code_id_fkey";

-- DropForeignKey
ALTER TABLE "phoneNumber" DROP CONSTRAINT "phoneNumber_status_code_fkey";

-- DropForeignKey
ALTER TABLE "phoneNumber" DROP CONSTRAINT "phoneNumber_user_id_fkey";

-- DropForeignKey
ALTER TABLE "qrCode" DROP CONSTRAINT "qrCode_status_code_fkey";

-- DropForeignKey
ALTER TABLE "userProfile" DROP CONSTRAINT "userProfile_language_code_fkey";

-- DropForeignKey
ALTER TABLE "userProfile" DROP CONSTRAINT "userProfile_status_code_fkey";

-- DropForeignKey
ALTER TABLE "userProfile" DROP CONSTRAINT "userProfile_user_id_fkey";

-- DropIndex
DROP INDEX "audit_log_status_code_idx";

-- DropIndex
DROP INDEX "event_session_id_idx";

-- AlterTable
ALTER TABLE "audio" DROP COLUMN "file_url",
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "audit_log" DROP COLUMN "new_value",
DROP COLUMN "old_value",
DROP COLUMN "status_code",
ADD COLUMN     "log_text" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "email" ALTER COLUMN "verified" SET DEFAULT false,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "event" DROP COLUMN "session_id",
DROP COLUMN "usersUserId",
ADD COLUMN     "details" TEXT NOT NULL,
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "exhibit" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "modified_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "exhibit_subtitle" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "image" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "subtitle" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "modified_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "modified_at" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "phoneNumber";

-- DropTable
DROP TABLE "qrCode";

-- DropTable
DROP TABLE "userProfile";

-- CreateTable
CREATE TABLE "audit_action" (
    "action_type" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "audit_action_pkey" PRIMARY KEY ("action_type")
);

-- CreateTable
CREATE TABLE "phone_number" (
    "phone_number_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "phone_number" CHAR(8) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "is_primary" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_code" VARCHAR(30) NOT NULL,

    CONSTRAINT "phone_number_pkey" PRIMARY KEY ("phone_number_id")
);

-- CreateTable
CREATE TABLE "qr_code" (
    "qr_code_id" UUID NOT NULL,
    "qr_link" VARCHAR(255) NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_code" VARCHAR(30) NOT NULL,

    CONSTRAINT "qr_code_pkey" PRIMARY KEY ("qr_code_id")
);

-- CreateTable
CREATE TABLE "user_profile" (
    "user_profile_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "language_code" VARCHAR(3) NOT NULL,
    "gender" CHAR(1) NOT NULL,
    "dob" DATE NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_code" VARCHAR(30) NOT NULL,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("user_profile_id")
);

-- CreateTable
CREATE TABLE "review" (
    "review_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "review_text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_pkey" PRIMARY KEY ("review_id")
);

-- CreateIndex
CREATE INDEX "phone_number_user_id_idx" ON "phone_number"("user_id");

-- CreateIndex
CREATE INDEX "phone_number_status_code_idx" ON "phone_number"("status_code");

-- CreateIndex
CREATE INDEX "qr_code_status_code_idx" ON "qr_code"("status_code");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_user_id_key" ON "user_profile"("user_id");

-- CreateIndex
CREATE INDEX "user_profile_language_code_idx" ON "user_profile"("language_code");

-- CreateIndex
CREATE INDEX "user_profile_status_code_idx" ON "user_profile"("status_code");

-- CreateIndex
CREATE INDEX "audit_log_action_type_idx" ON "audit_log"("action_type");

-- CreateIndex
CREATE INDEX "event_user_id_idx" ON "event"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_user_id_key" ON "user_role"("user_id");

-- AddForeignKey
ALTER TABLE "audio" ADD CONSTRAINT "audio_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibit" ADD CONSTRAINT "exhibit_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "qr_code"("qr_code_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibit" ADD CONSTRAINT "exhibit_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_action_type_fkey" FOREIGN KEY ("action_type") REFERENCES "audit_action"("action_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_number" ADD CONSTRAINT "phone_number_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_number" ADD CONSTRAINT "phone_number_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "status"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_code" ADD CONSTRAINT "qr_code_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "status"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_code" ADD CONSTRAINT "qr_code_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "language"("language_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "status"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtitle" ADD CONSTRAINT "subtitle_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
