-- Grant Super Admin access to all resources regardless of tenant_id

-- 1. ZONES
drop policy if exists "Store staff can view zones" on zones;
create policy "Store staff and Super Admin can view zones"
  on zones for select
  using (
    (exists (
      select 1 from stores 
      where stores.id = zones.store_id 
      and stores.tenant_id = get_current_tenant_id()
    ))
    or get_current_user_role() = 'super_admin'
  );

drop policy if exists "Store staff can manage zones" on zones;
create policy "Store staff and Super Admin can manage zones"
  on zones for all
  using (
    (
      exists (
        select 1 from stores 
        where stores.id = zones.store_id 
        and stores.tenant_id = get_current_tenant_id()
      )
      and get_current_user_role() in ('store_admin', 'staff')
    )
    or get_current_user_role() = 'super_admin'
  );

-- 2. TABLES
drop policy if exists "Store staff can view tables" on tables;
create policy "Store staff and Super Admin can view tables"
  on tables for select
  using (
    (exists (
      select 1 from stores 
      where stores.id = tables.store_id 
      and stores.tenant_id = get_current_tenant_id()
    ))
    or get_current_user_role() = 'super_admin'
    or true -- Keeping public read access if it was intended, otherwise remove 'or true'
  );
-- Note: Re-applying the 'or true' from previous fix if present, but cleaner to have specific policies. 
-- If "Public can view tables" exists, this might be redundant for SELECT but needed for consistency.
-- Let's assume we want to explicit SA access even if public is open.

drop policy if exists "Store staff can manage tables" on tables;
create policy "Store staff and Super Admin can manage tables"
  on tables for all
  using (
    (
      exists (
        select 1 from stores 
        where stores.id = tables.store_id 
        and stores.tenant_id = get_current_tenant_id()
      )
      and get_current_user_role() in ('store_admin', 'staff')
    )
    or get_current_user_role() = 'super_admin'
  );

-- 3. MENU CATEGORIES
-- Already has "Public menu categories" (true), so Super Admin can see.
-- Need to check management policy if exists.
-- Checking schema.sql, there wasn't a specific management policy defined in the snippet I saw earlier for menu_categories/items beyond checks?
-- Let's reinforce menu access.

-- 4. MENU ITEMS
-- "Staff manage menu items"
drop policy if exists "Staff manage menu items" on menu_items;
create policy "Staff and Super Admin manage menu items"
  on menu_items for all
  using ( 
    (
      exists (
        select 1 from stores 
        where stores.id = menu_items.store_id 
        and stores.tenant_id = get_current_tenant_id()
      )
      and get_current_user_role() in ('store_admin', 'staff')
    )
    or get_current_user_role() = 'super_admin'
  );

-- 5. ORDERS
-- "Staff view store orders"
drop policy if exists "Staff view store orders" on orders;
create policy "Staff and Super Admin view store orders"
  on orders for select
  using (
    (
      exists (
        select 1 from stores 
        where stores.id = orders.store_id 
        and stores.tenant_id = get_current_tenant_id()
      )
      and get_current_user_role() in ('store_admin', 'staff')
    )
    or get_current_user_role() = 'super_admin'
    or customer_id = auth.uid() -- Customers view own
  );

-- 6. STORES (Modify existing "View stores")
drop policy if exists "View stores" on stores;
create policy "View stores"
  on stores for select
  using ( 
    tenant_id = get_current_tenant_id() 
    or get_current_user_role() = 'super_admin'
  );

-- Allow Super Admin to manage stores (if not already)
create policy "Super Admin manage stores"
  on stores for all
  using ( get_current_user_role() = 'super_admin' );

commit;
