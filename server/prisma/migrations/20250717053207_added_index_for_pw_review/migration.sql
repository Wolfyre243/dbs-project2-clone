-- CreateIndex
CREATE INDEX "password_user_id_idx" ON "password"("user_id");

-- CreateIndex
CREATE INDEX "review_rating_review_text_idx" ON "review"("rating", "review_text");
