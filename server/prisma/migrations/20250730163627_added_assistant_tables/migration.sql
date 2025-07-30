-- CreateTable
CREATE TABLE "senderType" (
    "sender_type_id" SERIAL NOT NULL,
    "sender_type" VARCHAR(30) NOT NULL,

    CONSTRAINT "senderType_pkey" PRIMARY KEY ("sender_type_id")
);

-- CreateTable
CREATE TABLE "conversation" (
    "conversation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(100),
    "status_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("conversation_id")
);

-- CreateTable
CREATE TABLE "message" (
    "message_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "sender_type_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "status_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("message_id")
);

-- CreateIndex
CREATE INDEX "conversation_user_id_status_id_idx" ON "conversation"("user_id", "status_id");

-- CreateIndex
CREATE INDEX "message_conversation_id_status_id_idx" ON "message"("conversation_id", "status_id");

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_sender_type_id_fkey" FOREIGN KEY ("sender_type_id") REFERENCES "senderType"("sender_type_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("conversation_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;
