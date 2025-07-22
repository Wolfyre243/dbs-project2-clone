/*
  Warnings:

  - A unique constraint covering the columns `[action_type]` on the table `audit_action` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `event_type_id` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "event_user_id_idx";

-- AlterTable
ALTER TABLE "event" ADD COLUMN     "event_type_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "event_type" (
    "event_type_id" SERIAL NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "event_type_pkey" PRIMARY KEY ("event_type_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_type_event_type_key" ON "event_type"("event_type");

-- CreateIndex
CREATE UNIQUE INDEX "audit_action_action_type_key" ON "audit_action"("action_type");

-- CreateIndex
CREATE INDEX "event_user_id_event_type_id_idx" ON "event"("user_id", "event_type_id");

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "event_type"("event_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;
