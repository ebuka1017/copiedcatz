-- Fix: Remove RLS policy on Upload table that incorrectly references workspace_id
-- Error: record "new" has no field "workspace_id"

-- Drop any existing policies on Upload table that might reference workspace_id
DROP POLICY IF EXISTS "Users can insert uploads" ON "Upload";
DROP POLICY IF EXISTS "Users can view uploads" ON "Upload";
DROP POLICY IF EXISTS "Users can update uploads" ON "Upload";
DROP POLICY IF EXISTS "Users can delete uploads" ON "Upload";
DROP POLICY IF EXISTS "upload_insert_policy" ON "Upload";
DROP POLICY IF EXISTS "upload_select_policy" ON "Upload";
DROP POLICY IF EXISTS "upload_update_policy" ON "Upload";
DROP POLICY IF EXISTS "upload_delete_policy" ON "Upload";

-- Enable RLS on Upload table
ALTER TABLE "Upload" ENABLE ROW LEVEL SECURITY;

-- Create correct RLS policies that only check user_id (not workspace_id)
CREATE POLICY "Users can insert own uploads"
ON "Upload" FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own uploads"
ON "Upload" FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own uploads"
ON "Upload" FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own uploads"
ON "Upload" FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
