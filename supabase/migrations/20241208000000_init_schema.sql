-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Plan') THEN
        CREATE TYPE "Plan" AS ENUM ('FREE', 'STARTER', 'PRO', 'ENTERPRISE');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionStatus') THEN
        CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UploadStatus') THEN
        CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED', 'EXPIRED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExtractionStatus') THEN
        CREATE TYPE "ExtractionStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WorkspaceRole') THEN
        CREATE TYPE "WorkspaceRole" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UsageAction') THEN
        CREATE TYPE "UsageAction" AS ENUM ('EXTRACTION', 'GENERATION', 'API_CALL');
    END IF;
END
$$;

-- Users
CREATE TABLE IF NOT EXISTS "User" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "email_verified" BOOLEAN DEFAULT false,
    "plan" "Plan" DEFAULT 'FREE',
    "credits_remaining" INTEGER DEFAULT 10,
    "stripe_customer_id" TEXT UNIQUE,
    "stripe_subscription_id" TEXT UNIQUE,
    "subscription_status" "SubscriptionStatus",
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now(),
    "last_login_at" TIMESTAMPTZ
);

-- Uploads
CREATE TABLE IF NOT EXISTS "Upload" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "filepath" TEXT NOT NULL,
    "status" "UploadStatus" DEFAULT 'PENDING',
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- Extraction Jobs
CREATE TABLE IF NOT EXISTS "ExtractionJob" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "upload_id" UUID NOT NULL REFERENCES "Upload"("id") ON DELETE CASCADE,
    "status" "ExtractionStatus" DEFAULT 'PROCESSING',
    "progress" INTEGER DEFAULT 0,
    "error" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now()
);

-- Folders
CREATE TABLE IF NOT EXISTS "Folder" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "parent_id" UUID REFERENCES "Folder"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- Templates
CREATE TABLE IF NOT EXISTS "Template" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "original_image_url" TEXT NOT NULL,
    "structured_prompt" JSONB NOT NULL,
    "folder_id" UUID REFERENCES "Folder"("id") ON DELETE SET NULL,
    "is_public" BOOLEAN DEFAULT false,
    "tags" TEXT[],
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now()
);

-- Variations
CREATE TABLE IF NOT EXISTS "Variation" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "template_id" UUID NOT NULL REFERENCES "Template"("id") ON DELETE CASCADE,
    "image_url" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "modified_prompt" JSONB NOT NULL,
    "generation_time_ms" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- Workspaces
CREATE TABLE IF NOT EXISTS "Workspace" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "owner_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now()
);

-- Workspace Members
CREATE TABLE IF NOT EXISTS "WorkspaceMember" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "workspace_id" UUID NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "role" "WorkspaceRole" DEFAULT 'VIEWER',
    "joined_at" TIMESTAMPTZ DEFAULT now(),
    UNIQUE("workspace_id", "user_id")
);

-- Usage Logs
CREATE TABLE IF NOT EXISTS "UsageLog" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL, 
    "action" "UsageAction" NOT NULL,
    "credits_used" INTEGER DEFAULT 1,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- Stripe Events
CREATE TABLE IF NOT EXISTS "StripeEvent" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "stripe_event_id" TEXT NOT NULL UNIQUE,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "processed" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX ON "User" ("email");
CREATE INDEX ON "User" ("stripe_customer_id");
CREATE INDEX ON "Upload" ("user_id");
CREATE INDEX ON "Upload" ("status");
CREATE INDEX ON "Upload" ("expires_at");
CREATE INDEX ON "ExtractionJob" ("user_id");
CREATE INDEX ON "ExtractionJob" ("status");
CREATE INDEX ON "Template" ("user_id");
CREATE INDEX ON "Template" ("folder_id");
CREATE INDEX ON "Template" ("is_public");
CREATE INDEX ON "Variation" ("template_id");
CREATE INDEX ON "Folder" ("user_id");
CREATE INDEX ON "Folder" ("parent_id");
CREATE INDEX ON "Workspace" ("owner_id");
CREATE INDEX ON "UsageLog" ("user_id");
CREATE INDEX ON "StripeEvent" ("processed");
