-- CreateTable
CREATE TABLE "audit_action" (
    "action_type_id" SERIAL NOT NULL,
    "action_type" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "audit_action_pkey" PRIMARY KEY ("action_type_id")
);

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_action_type_id_fkey" FOREIGN KEY ("action_type_id") REFERENCES "audit_action"("action_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;
