/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `email` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "email_email_key" ON "email"("email");
