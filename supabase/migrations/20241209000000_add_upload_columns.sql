-- Add missing columns to Upload table for file metadata
ALTER TABLE "Upload" ADD COLUMN IF NOT EXISTS "filename" TEXT;
ALTER TABLE "Upload" ADD COLUMN IF NOT EXISTS "filetype" TEXT;
ALTER TABLE "Upload" ADD COLUMN IF NOT EXISTS "size" BIGINT;
