-- 1. Add tenant_id to orders
alter table orders add column tenant_id uuid references tenants(id) on delete cascade;

-- 2. Populate tenant_id for existing orders (based on store)
update orders
set tenant_id = stores.tenant_id
from stores
where orders.store_id = stores.id;

-- 3. Update Policy to use direct tenant_id check (Faster & Realtime friendly)
drop policy "Staff view store orders" on orders;

create policy "Staff view tenant orders"
  on orders for select
  using (
    tenant_id = get_current_tenant_id()
    and get_current_user_role() in ('store_admin', 'staff')
  );

-- Note: We need to ensure we save tenant_id when creating orders now!
