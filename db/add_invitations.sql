-- Create Invitations Table
create table team_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  email text not null,
  role user_role default 'staff',
  status text default 'pending', -- pending, accepted
  created_at timestamptz default now()
);

-- RLS for Invitations
alter table team_invitations enable row level security;

-- Store Admins can view/create/delete invitations for their tenant
create policy "Admins manage invitations"
  on team_invitations
  for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.tenant_id = team_invitations.tenant_id
      and profiles.role = 'store_admin'
    )
  );

-- Update the new user handler to check for invitations
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  invite_record record;
begin
  -- Check for existing invitation
  select * into invite_record
  from team_invitations
  where email = new.email
  limit 1;

  if found then
    -- User was invited! Assign to tenant immediately.
    insert into public.profiles (id, full_name, avatar_url, email, tenant_id, role)
    values (
      new.id,
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'avatar_url',
      new.email,
      invite_record.tenant_id,
      invite_record.role :: user_role
    );
    
    -- Clean up invitation (optional, or mark accepted)
    delete from team_invitations where id = invite_record.id;
  else
    -- Standard Signup (Customer)
    insert into public.profiles (id, full_name, avatar_url, email)
    values (
      new.id,
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'avatar_url',
      new.email
    );
  end if;

  return new;
end;
$$;
