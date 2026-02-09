-- Allow staff to view order items for their store's orders
create policy "Staff can view order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      join stores on stores.id = orders.store_id
      where orders.id = order_items.order_id
      and stores.tenant_id = get_current_tenant_id()
    )
    and get_current_user_role() in ('store_admin', 'staff')
  );

-- Allow customers to view their own order items
create policy "Customers can view own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.customer_id = (select id from profiles where id = auth.uid())
    )
  );

-- Allow public access to view order items if they can view the order?
-- This is tricky for guest checkout confirmation.
-- Ideally guests get returned the items on creation or use a signed token.
-- For now, maybe creating a broad policy for reading items if you know the Order ID is hard to secure without auth.
-- But the immediate issue is STAFF not seeing items.
