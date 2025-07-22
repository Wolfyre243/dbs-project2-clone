/*
  Warnings:

  - You are about to drop the column `action_type` on the `audit_log` table. All the data in the column will be lost.
  - Added the required column `action_type_id` to the `audit_log` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "audit_log_user_id_action_type_idx";

-- AlterTable
ALTER TABLE "audit_log" DROP COLUMN "action_type",
ADD COLUMN     "action_type_id" INTEGER NOT NULL,
ALTER COLUMN "timestamp" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "audit_log_user_id_action_type_id_idx" ON "audit_log"("user_id", "action_type_id");
