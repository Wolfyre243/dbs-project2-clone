/*
  Warnings:

  - You are about to drop the `senderType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_sender_type_id_fkey";

-- DropTable
DROP TABLE "senderType";
