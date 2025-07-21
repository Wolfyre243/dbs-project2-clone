-- DropForeignKey
ALTER TABLE "subtitle" DROP CONSTRAINT "subtitle_language_code_fkey";

-- DropForeignKey
ALTER TABLE "user_profile" DROP CONSTRAINT "user_profile_language_code_fkey";

-- AlterTable
ALTER TABLE "subtitle" ALTER COLUMN "language_code" SET DATA TYPE VARCHAR(6);

-- AlterTable
ALTER TABLE "user_profile" ALTER COLUMN "language_code" SET DATA TYPE VARCHAR(6);

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "language"("language_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtitle" ADD CONSTRAINT "subtitle_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "language"("language_code") ON DELETE RESTRICT ON UPDATE CASCADE;
