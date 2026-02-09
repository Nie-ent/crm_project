-- TEMPORARY DEBUG: Open up Orders Select
drop policy if exists "Staff view tenant orders" on orders;
drop policy if exists "Debug: Everyone can view orders" on orders;

create policy "Debug: Everyone can view orders"
  on orders for select
  using ( true );

-- Removed the 'alter publication' line since it's already enabled.
