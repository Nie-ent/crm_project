-- Allow public (anyone) to view stores
-- We can refine this to only specific fields if needed, but for now full read is fine for the store page.
create policy "Public can view stores"
  on stores for select
  using ( true );
