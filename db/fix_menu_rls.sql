-- Helper to check if a store belongs to the current user's tenant
-- (This logic is often embedded in policies, but simple checks are better)

-- Menu Categories Policies
create policy "Store Admins can insert menu_categories"
  on menu_categories for insert
  with check (
    exists (
      select 1 from stores
      where stores.id = menu_categories.store_id
      and stores.tenant_id = get_current_tenant_id()
    )
    and get_current_user_role() in ('store_admin', 'super_admin')
  );

create policy "Store Admins can update menu_categories"
  on menu_categories for update
  using (
    exists (
      select 1 from stores
      where stores.id = menu_categories.store_id
      and stores.tenant_id = get_current_tenant_id()
    )
    and get_current_user_role() in ('store_admin', 'super_admin')
  );

create policy "Store Admins can delete menu_categories"
  on menu_categories for delete
  using (
    exists (
      select 1 from stores
      where stores.id = menu_categories.store_id
      and stores.tenant_id = get_current_tenant_id()
    )
    and get_current_user_role() in ('store_admin', 'super_admin')
  );

-- Menu Items Policies
create policy "Store Admins can insert menu_items"
  on menu_items for insert
  with check (
    exists (
      select 1 from stores
      where stores.id = menu_items.store_id
      and stores.tenant_id = get_current_tenant_id()
    )
    and get_current_user_role() in ('store_admin', 'super_admin')
  );

create policy "Store Admins can update menu_items"
  on menu_items for update
  using (
    exists (
      select 1 from stores
      where stores.id = menu_items.store_id
      and stores.tenant_id = get_current_tenant_id()
    )
    and get_current_user_role() in ('store_admin', 'super_admin')
  );

create policy "Store Admins can delete menu_items"
  on menu_items for delete
  using (
    exists (
      select 1 from stores
      where stores.id = menu_items.store_id
      and stores.tenant_id = get_current_tenant_id()
    )
    and get_current_user_role() in ('store_admin', 'super_admin')
  );
