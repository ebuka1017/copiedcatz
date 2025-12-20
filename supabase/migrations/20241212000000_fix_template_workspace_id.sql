-- Fix: Add workspace_id column to Template table
-- Error: record "new" has no field "workspace_id"

-- Add workspace_id column (nullable to support existing rows)
ALTER TABLE "Template"
ADD COLUMN IF NOT EXISTS "workspace_id" UUID REFERENCES "Workspace"("id") ON DELETE SET NULL;

-- Create index for workspace_id lookups
CREATE INDEX IF NOT EXISTS "Template_workspace_id_idx" ON "Template" ("workspace_id");
