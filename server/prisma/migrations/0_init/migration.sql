-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL,
    "username" VARCHAR(30) NOT NULL,
    "password" CHAR(60) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "modified_at" TIMESTAMPTZ NOT NULL,
    "status_code" VARCHAR(30) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "status" (
    "status_code" VARCHAR(30) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "status_pkey" PRIMARY KEY ("status_code")
);

-- CreateTable
CREATE TABLE "audio" (
    "audio_id" UUID NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "created_by" UUID NOT NULL,
    "language_id" VARCHAR(3) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "status_code" VARCHAR(30) NOT NULL,

    CONSTRAINT "audio_pkey" PRIMARY KEY ("audio_id")
);

-- CreateTable
CREATE TABLE "exhibit_audio_relation" (
    "audio_id" UUID NOT NULL,
    "exhibit_id" UUID NOT NULL,

    CONSTRAINT "exhibit_audio_relation_pkey" PRIMARY KEY ("audio_id","exhibit_id")
);

-- CreateTable
CREATE TABLE "exhibit" (
    "exhibit_id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "audio_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "qr_code_id" UUID NOT NULL,
    "image_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "modified_at" TIMESTAMPTZ NOT NULL,
    "status_code" VARCHAR(30) NOT NULL,

    CONSTRAINT "exhibit_pkey" PRIMARY KEY ("exhibit_id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "audit_log_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "ip_address" VARCHAR(45) NOT NULL,
    "entity_name" VARCHAR(100) NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action_type" VARCHAR(100) NOT NULL,
    "old_value" TEXT NOT NULL,
    "new_value" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,
    "status_code" VARCHAR(30) NOT NULL,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("audit_log_id")
);

-- CreateTable
CREATE TABLE "phoneNumber" (
    "phone_number_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "phone_number" CHAR(8) NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "is_primary" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "status_code" VARCHAR(30) NOT NULL,

    CONSTRAINT "phoneNumber_pkey" PRIMARY KEY ("phone_number_id")
);

-- CreateTable
CREATE TABLE "email" (
    "email_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "is_primary" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "status_code" VARCHAR(30) NOT NULL,

    CONSTRAINT "email_pkey" PRIMARY KEY ("email_id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "user_id" UUID NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "role" (
    "role_id" SERIAL NOT NULL,
    "role_name" VARCHAR(20) NOT NULL,
    "description" TEXT NOT NULL,
    "status_code" VARCHAR(30) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "qrCode" (
    "qr_code_id" UUID NOT NULL,
    "qr_link" VARCHAR(255) NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "status_code" VARCHAR(30) NOT NULL,

    CONSTRAINT "qrCode_pkey" PRIMARY KEY ("qr_code_id")
);

-- CreateTable
CREATE TABLE "image" (
    "image_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "status_code" VARCHAR(30) NOT NULL,

    CONSTRAINT "image_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "event" (
    "event_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "entity_name" VARCHAR(100) NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,
    "usersUserId" UUID,

    CONSTRAINT "event_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "session" (
    "session_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "device_info" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "userProfile" (
    "user_profile_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "language_code" VARCHAR(3) NOT NULL,
    "gender" CHAR(1) NOT NULL,
    "dob" DATE NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "modified_at" TIMESTAMPTZ NOT NULL,
    "status_code" VARCHAR(30) NOT NULL,

    CONSTRAINT "userProfile_pkey" PRIMARY KEY ("user_profile_id")
);

-- CreateTable
CREATE TABLE "language" (
    "language_code" VARCHAR(3) NOT NULL,
    "language_name" VARCHAR(50) NOT NULL,
    "status_code" VARCHAR(30) NOT NULL,

    CONSTRAINT "language_pkey" PRIMARY KEY ("language_code")
);

-- CreateTable
CREATE TABLE "subtitle" (
    "subtitle_id" UUID NOT NULL,
    "subtitle_text" TEXT NOT NULL,
    "language_code" VARCHAR(3) NOT NULL,
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "modified_at" TIMESTAMPTZ NOT NULL,
    "status_code" VARCHAR(30) NOT NULL,

    CONSTRAINT "subtitle_pkey" PRIMARY KEY ("subtitle_id")
);

-- CreateTable
CREATE TABLE "exhibit_subtitle" (
    "exhibit_id" UUID NOT NULL,
    "subtitle_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "exhibit_subtitle_pkey" PRIMARY KEY ("exhibit_id","subtitle_id")
);

-- CreateIndex
CREATE INDEX "users_status_code_idx" ON "users"("status_code");

-- CreateIndex
CREATE INDEX "audio_status_code_idx" ON "audio"("status_code");

-- CreateIndex
CREATE INDEX "audio_language_id_idx" ON "audio"("language_id");

-- CreateIndex
CREATE INDEX "exhibit_status_code_idx" ON "exhibit"("status_code");

-- CreateIndex
CREATE INDEX "exhibit_audio_id_idx" ON "exhibit"("audio_id");

-- CreateIndex
CREATE INDEX "exhibit_qr_code_id_idx" ON "exhibit"("qr_code_id");

-- CreateIndex
CREATE INDEX "exhibit_image_id_idx" ON "exhibit"("image_id");

-- CreateIndex
CREATE INDEX "audit_log_user_id_idx" ON "audit_log"("user_id");

-- CreateIndex
CREATE INDEX "audit_log_status_code_idx" ON "audit_log"("status_code");

-- CreateIndex
CREATE INDEX "phoneNumber_user_id_idx" ON "phoneNumber"("user_id");

-- CreateIndex
CREATE INDEX "phoneNumber_status_code_idx" ON "phoneNumber"("status_code");

-- CreateIndex
CREATE INDEX "email_user_id_idx" ON "email"("user_id");

-- CreateIndex
CREATE INDEX "email_status_code_idx" ON "email"("status_code");

-- CreateIndex
CREATE INDEX "user_role_user_id_idx" ON "user_role"("user_id");

-- CreateIndex
CREATE INDEX "user_role_role_id_idx" ON "user_role"("role_id");

-- CreateIndex
CREATE INDEX "role_status_code_idx" ON "role"("status_code");

-- CreateIndex
CREATE INDEX "qrCode_status_code_idx" ON "qrCode"("status_code");

-- CreateIndex
CREATE INDEX "image_status_code_idx" ON "image"("status_code");

-- CreateIndex
CREATE INDEX "event_session_id_idx" ON "event"("session_id");

-- CreateIndex
CREATE INDEX "session_user_id_idx" ON "session"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "userProfile_user_id_key" ON "userProfile"("user_id");

-- CreateIndex
CREATE INDEX "userProfile_language_code_idx" ON "userProfile"("language_code");

-- CreateIndex
CREATE INDEX "userProfile_status_code_idx" ON "userProfile"("status_code");

-- CreateIndex
CREATE INDEX "language_status_code_idx" ON "language"("status_code");

-- CreateIndex
CREATE INDEX "subtitle_language_code_idx" ON "subtitle"("language_code");

-- CreateIndex
CREATE INDEX "subtitle_status_code_idx" ON "subtitle"("status_code");

-- CreateIndex
CREATE INDEX "exhibit_subtitle_exhibit_id_idx" ON "exhibit_subtitle"("exhibit_id");

-- CreateIndex
CREATE INDEX "exhibit_subtitle_subtitle_id_idx" ON "exhibit_subtitle"("subtitle_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "status"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio" ADD CONSTRAINT "audio_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "language"("language_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio" ADD CONSTRAINT "audio_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "status"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibit_audio_relation" ADD CONSTRAINT "exhibit_audio_relation_audio_id_fkey" FOREIGN KEY ("audio_id") REFERENCES "audio"("audio_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibit_audio_relation" ADD CONSTRAINT "exhibit_audio_relation_exhibit_id_fkey" FOREIGN KEY ("exhibit_id") REFERENCES "exhibit"("exhibit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibit" ADD CONSTRAINT "exhibit_audio_id_fkey" FOREIGN KEY ("audio_id") REFERENCES "audio"("audio_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibit" ADD CONSTRAINT "exhibit_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "qrCode"("qr_code_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibit" ADD CONSTRAINT "exhibit_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "image"("image_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibit" ADD CONSTRAINT "exhibit_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "status"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "status"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phoneNumber" ADD CONSTRAINT "phoneNumber_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phoneNumber" ADD CONSTRAINT "phoneNumber_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "status"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email" ADD CONSTRAINT "email_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email" ADD CONSTRAINT "email_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "status"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "status"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qrCode" ADD CONSTRAINT "qrCode_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "status"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "status"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_usersUserId_fkey" FOREIGN KEY ("usersUserId") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userProfile" ADD CONSTRAINT "userProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userProfile" ADD CONSTRAINT "userProfile_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "language"("language_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userProfile" ADD CONSTRAINT "userProfile_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "status"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "language" ADD CONSTRAINT "language_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "status"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtitle" ADD CONSTRAINT "subtitle_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "language"("language_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtitle" ADD CONSTRAINT "subtitle_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "status"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibit_subtitle" ADD CONSTRAINT "exhibit_subtitle_exhibit_id_fkey" FOREIGN KEY ("exhibit_id") REFERENCES "exhibit"("exhibit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibit_subtitle" ADD CONSTRAINT "exhibit_subtitle_subtitle_id_fkey" FOREIGN KEY ("subtitle_id") REFERENCES "subtitle"("subtitle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

