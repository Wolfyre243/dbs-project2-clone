-- DropForeignKey
ALTER TABLE "exhibit" DROP CONSTRAINT "exhibit_image_id_fkey";

-- AlterTable
ALTER TABLE "exhibit" ALTER COLUMN "image_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "exhibit" ADD CONSTRAINT "exhibit_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "image"("image_id") ON DELETE SET NULL ON UPDATE CASCADE;
