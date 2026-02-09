-- Create the storage bucket for menu images
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

-- Set up RLS for the storage bucket
-- 1. Allow public access to view images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'menu-images' );

-- 2. Allow authenticated users to upload images
create policy "Authenticated Upload"
  on storage.objects for insert
  with check (
    bucket_id = 'menu-images' 
    and auth.role() = 'authenticated'
  );

-- 3. Allow users to update their own uploads (optional, but good for management)
create policy "Authenticated Update"
  on storage.objects for update
  using (
    bucket_id = 'menu-images' 
    and auth.role() = 'authenticated'
  );

create policy "Authenticated Delete"
  on storage.objects for delete
  using (
    bucket_id = 'menu-images' 
    and auth.role() = 'authenticated'
  );
