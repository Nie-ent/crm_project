-- Allow store staff and admins to update orders (e.g. change status)
create policy "Staff can update store orders"
  on orders for update
  using (
    exists (
      select 1 from stores 
      where stores.id = orders.store_id 
      and stores.tenant_id = get_current_tenant_id()
    )
    and get_current_user_role() in ('store_admin', 'staff')
  );

-- Allow store staff and admins to update order items (if needed)
create policy "Staff can update store order items"
  on order_items for update
  using (
    exists (
      select 1 from orders
      join stores on stores.id = orders.store_id
      where orders.id = order_items.order_id
      and stores.tenant_id = get_current_tenant_id()
    )
    and get_current_user_role() in ('store_admin', 'staff')
  );
