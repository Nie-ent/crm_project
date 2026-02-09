-- Allow store admins/staff to view zones
create policy "Store staff can view zones"
  on zones for select
  using (
    exists (
      select 1 from stores 
      where stores.id = zones.store_id 
      and stores.tenant_id = get_current_tenant_id()
    )
  );

-- Allow store admins/staff to manage zones (insert, update, delete)
create policy "Store staff can manage zones"
  on zones for all
  using (
    exists (
      select 1 from stores 
      where stores.id = zones.store_id 
      and stores.tenant_id = get_current_tenant_id()
    )
    and get_current_user_role() in ('store_admin', 'staff')
  );

-- Allow store admins/staff to view tables
create policy "Store staff can view tables"
  on tables for select
  using (
    exists (
      select 1 from stores 
      where stores.id = tables.store_id 
      and stores.tenant_id = get_current_tenant_id()
    )
  );

-- Allow store admins/staff to manage tables
create policy "Store staff can manage tables"
  on tables for all
  using (
    exists (
      select 1 from stores 
      where stores.id = tables.store_id 
      and stores.tenant_id = get_current_tenant_id()
    )
    and get_current_user_role() in ('store_admin', 'staff')
  );

-- Public access to view zones? (Maybe for reservation system later)
-- Public access to view tables? (Maybe for reservation system later)
-- For now we restrict to authenticated staff for management, but we might need read access for QR code resolution if it's public.
-- Adding public read for tables so the store page can fetch table name by ID without auth.

create policy "Public can view tables"
  on tables for select
  using ( true );

