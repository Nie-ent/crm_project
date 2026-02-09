-- Enable Realtime for the orders table
alter publication supabase_realtime add table orders;

-- Enable Realtime for the order_items table (if we want to listen to item changes too)
alter publication supabase_realtime add table order_items;

-- Note: This requires the "supabase_realtime" publication to exist (it usually does by default).
