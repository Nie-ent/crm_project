-- 1. Ensure the helper function exists and is SECURITY DEFINER (Bypasses RLS on profiles)
create or replace function get_current_tenant_id()
returns uuid as $$
begin
  return (select tenant_id from profiles where id = auth.uid());
end;
$$ language plpgsql security definer;

-- 2. Backfill tenant_id on orders if any are missing
-- (Crucial: If tenant_id is null, the policy filters it out)
update orders
set tenant_id = stores.tenant_id
from stores
where orders.store_id = stores.id
and orders.tenant_id is null;

-- 3. Drop old policies to clean up
drop policy if exists "Staff view tenant orders secure" on orders;
drop policy if exists "Debug: Everyone can view orders" on orders;
drop policy if exists "Staff view tenant orders" on orders;

-- 4. Apply the optimized policy
create policy "Staff view tenant orders"
  on orders for select
  using (
    -- Direct comparison is fast and Realtime friendly
    tenant_id = get_current_tenant_id()
  );

-- 5. Grant permissions (just in case)
grant select on orders to authenticated;
