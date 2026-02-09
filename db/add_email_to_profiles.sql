-- Add email column to profiles
alter table profiles add column email text;

-- Sync existing emails (This requires a bit of magic or doing it manually)
-- Since we can't query auth.users easily in SQL from here without permissions.
-- We will update the handle_new_user function to sync email on NEW users.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    new.email
  );
  return new;
end;
$$;

-- Note: Existing users won't have email populated.
-- We might need a one-time script with Service Role to fix that.
