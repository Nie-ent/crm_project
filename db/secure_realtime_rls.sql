-- Revert the Debug Policy
drop policy if exists "Debug: Everyone can view orders" on orders;

-- Apply Secure Policy (Direct Join)
-- This allows any staff member with the SAME tenant_id as the order to view it.
create policy "Staff view tenant orders secure"
  on orders for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.tenant_id = orders.tenant_id
      and profiles.role in ('store_admin', 'staff')
    )
  );
