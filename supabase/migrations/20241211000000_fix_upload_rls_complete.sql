-- Complete fix: Drop ALL policies on Upload table and recreate correct ones
-- This ensures any policy referencing workspace_id is removed, regardless of name

-- First, drop ALL existing policies on Upload table using dynamic SQL
DO $$
DECLARE
    policy_name text;
BEGIN
    FOR policy_name IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'Upload' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON "Upload"', policy_name);
        RAISE NOTICE 'Dropped policy: %', policy_name;
    END LOOP;
END $$;

-- Enable RLS on Upload table
ALTER TABLE "Upload" ENABLE ROW LEVEL SECURITY;

-- Create correct RLS policies that only check user_id (not workspace_id)
-- The Upload table does NOT have a workspace_id column

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
