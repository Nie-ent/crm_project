-- Allow anyone (including guests) to create orders
create policy "Enable insert for everyone"
on orders for insert
with check (true);

-- Allow anyone to add items to orders
create policy "Enable insert for everyone"
on order_items for insert
with check (true);

-- Allow public read of menu items (ensure this exists)
-- (Already exists in schema.sql: "Public menu items")

-- Optional: Allow reading created order for confirmation page?
-- For now, the action returns just the ID.
