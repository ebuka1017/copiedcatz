-- Fix: Add missing columns to Template table that triggers expect
-- Errors: record "new" has no field "workspace_id" / "template_id"

-- Add workspace_id column (nullable to support existing rows)
ALTER TABLE "Template"
ADD COLUMN IF NOT EXISTS "workspace_id" UUID REFERENCES "Workspace"("id") ON DELETE SET NULL;

-- Add template_id as a generated column mirroring id (for trigger compatibility)
ALTER TABLE "Template"
ADD COLUMN IF NOT EXISTS "template_id" UUID GENERATED ALWAYS AS ("id") STORED;

-- Create indexes
CREATE INDEX IF NOT EXISTS "Template_workspace_id_idx" ON "Template" ("workspace_id");
