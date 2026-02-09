-- Secure function to find a user by email for invitation
-- Returns partial info (id, tenant_id) only to verify existence and availability.
create or replace function get_profile_by_email(email_input text)
returns table (id uuid, tenant_id uuid)
language plpgsql
security definer -- Bypass RLS
set search_path = public -- Secure search path
as $$
begin
  return query
  select profiles.id, profiles.tenant_id
  from profiles
  where profiles.email = email_input;
end;
$$;

-- Grant execute to authenticated users (Store Admins will use it)
grant execute on function get_profile_by_email(text) to authenticated;
