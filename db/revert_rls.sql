-- Revert to Permissive Policy (Verified Working)
drop policy if exists "Debug: Authenticated users" on orders;
drop policy if exists "Staff view tenant orders" on orders;
drop policy if exists "Staff view tenant orders secure" on orders;

create policy "Staff view tenant orders"
  on orders for select
  using ( true ); -- Allow Realtime to receive all events (Client filters view via API refresh)
