-- TEMPORARY DEBUG: Check if Auth is the issue
drop policy if exists "Staff view tenant orders" on orders;

-- Allow ANY authenticated user to see orders (ignores tenant_id for a moment)
create policy "Debug: Authenticated users"
  on orders for select
  using ( auth.role() = 'authenticated' );
