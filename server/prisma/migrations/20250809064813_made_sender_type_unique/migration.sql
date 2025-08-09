/*
  Warnings:

  - A unique constraint covering the columns `[sender_type]` on the table `sender_type` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "sender_type_sender_type_key" ON "sender_type"("sender_type");
