-- Fix Replica Identity (Ensures we get the full row on updates)
alter table orders replica identity full;

-- (Removed the 'alter publication' line to avoid duplicate error)
