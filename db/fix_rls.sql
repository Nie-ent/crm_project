-- Allow Super Admins to create new tenants
create policy "Super Admins can insert tenants"
  on tenants for insert
  with check ( get_current_user_role() = 'super_admin' );

-- Allow Super Admins to update tenants (e.g. suspend)
create policy "Super Admins can update tenants"
  on tenants for update
  using ( get_current_user_role() = 'super_admin' );

-- Allow Super Admins to delete tenants (optional, but good for cleanup)
create policy "Super Admins can delete tenants"
  on tenants for delete
  using ( get_current_user_role() = 'super_admin' );
