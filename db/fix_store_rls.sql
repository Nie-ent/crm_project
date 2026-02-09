-- Allow Store Admins to create stores for their tenant
create policy "Store Admins can insert stores"
  on stores for insert
  with check ( 
    tenant_id = get_current_tenant_id()
    and get_current_user_role() in ('store_admin', 'super_admin')
  );

-- Allow Store Admins to update their stores
create policy "Store Admins can update stores"
  on stores for update
  using ( 
    tenant_id = get_current_tenant_id()
    and get_current_user_role() in ('store_admin', 'super_admin')
  );
