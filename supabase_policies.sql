-- Enable RLS on storage.objects if not already enabled (usually enabled by default)
alter table storage.objects enable row level security;

-- Create 'uploads' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- POLICY: Allow authenticated users to upload files to 'uploads' bucket
-- They can only upload to their own folder: uploads/{user_id}/{filename}
create policy "Authenticated users can upload own files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'uploads' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- POLICY: Allow authenticated users to update/delete their own files
create policy "Users can update own files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'uploads' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'uploads' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- POLICY: Allow public access to read files in 'uploads' (needed for Bria AI to access images)
create policy "Public Read Access"
on storage.objects for select
to public
using ( bucket_id = 'uploads' );


-- TEMPLATES TABLE POLICIES -------------------------

-- Ensure RLS is enabled
alter table templates enable row level security;

-- Allow users to view their own templates
create policy "Users can view own templates"
on templates for select
to authenticated
using ( auth.uid()::text = user_id );

-- Allow users to view public templates (Marketplace)
create policy "Users can view public templates"
on templates for select
to authenticated
using ( is_public = true );

-- Allow users to create their own templates
create policy "Users can insert own templates"
on templates for insert
to authenticated
with check ( auth.uid()::text = user_id );

-- Allow users to update their own templates
create policy "Users can update own templates"
on templates for update
to authenticated
using ( auth.uid()::text = user_id );

-- Allow users to delete their own templates
create policy "Users can delete own templates"
on templates for delete
to authenticated
using ( auth.uid()::text = user_id );
