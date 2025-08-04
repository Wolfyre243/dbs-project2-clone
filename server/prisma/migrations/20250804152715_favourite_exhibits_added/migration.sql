-- CreateTable
CREATE TABLE "favorite_exhibit" (
    "user_id" UUID NOT NULL,
    "exhibit_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_exhibit_pkey" PRIMARY KEY ("user_id","exhibit_id")
);

-- CreateIndex
CREATE INDEX "favorite_exhibit_user_id_exhibit_id_idx" ON "favorite_exhibit"("user_id", "exhibit_id");

-- AddForeignKey
ALTER TABLE "favorite_exhibit" ADD CONSTRAINT "favorite_exhibit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_exhibit" ADD CONSTRAINT "favorite_exhibit_exhibit_id_fkey" FOREIGN KEY ("exhibit_id") REFERENCES "exhibit"("exhibit_id") ON DELETE CASCADE ON UPDATE CASCADE;
