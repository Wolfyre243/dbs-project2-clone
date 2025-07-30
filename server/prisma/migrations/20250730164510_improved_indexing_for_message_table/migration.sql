-- DropIndex
DROP INDEX "message_conversation_id_status_id_idx";

-- CreateIndex
CREATE INDEX "message_conversation_id_status_id_created_at_sender_type_id_idx" ON "message"("conversation_id", "status_id", "created_at", "sender_type_id");
