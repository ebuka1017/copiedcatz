-- Enable RLS on Variation table
ALTER TABLE "Variation" ENABLE ROW LEVEL SECURITY;

-- Users can insert variations for templates they own
CREATE POLICY "Users can insert variations for own templates"
ON "Variation" FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "Template"
        WHERE "Template"."id" = template_id
        AND "Template"."user_id" = auth.uid()
    )
);

-- Users can view variations for templates they own
CREATE POLICY "Users can view variations for own templates"
ON "Variation" FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM "Template"
        WHERE "Template"."id" = template_id
        AND "Template"."user_id" = auth.uid()
    )
);

-- Users can delete variations for templates they own
CREATE POLICY "Users can delete variations for own templates"
ON "Variation" FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM "Template"
        WHERE "Template"."id" = template_id
        AND "Template"."user_id" = auth.uid()
    )
);

-- Allow service role to bypass RLS (for admin operations)
-- This is automatic with service_role key, but ensuring it's clear
