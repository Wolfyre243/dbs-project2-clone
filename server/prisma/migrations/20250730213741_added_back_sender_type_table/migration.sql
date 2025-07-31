-- CreateTable
CREATE TABLE "sender_type" (
    "sender_type_id" SERIAL NOT NULL,
    "sender_type" VARCHAR(30) NOT NULL,

    CONSTRAINT "sender_type_pkey" PRIMARY KEY ("sender_type_id")
);

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_sender_type_id_fkey" FOREIGN KEY ("sender_type_id") REFERENCES "sender_type"("sender_type_id") ON DELETE CASCADE ON UPDATE CASCADE;
