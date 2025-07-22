/*
  Warnings:

  - You are about to drop the `audit_action` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "audit_log" DROP CONSTRAINT "audit_log_action_type_fkey";

-- DropTable
DROP TABLE "audit_action";
