-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. ENUMS & TYPES
-- -----------------------------------------------------------------------------
create type user_role as enum ('super_admin', 'store_admin', 'staff', 'customer');
create type store_type as enum ('a_la_carte', 'buffet');
create type order_status as enum ('pending', 'cooking', 'served', 'completed', 'cancelled');
create type payment_status as enum ('pending', 'paid', 'refunded');

-- -----------------------------------------------------------------------------
-- 2. TENANTS (Organizations)
-- -----------------------------------------------------------------------------
create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  status text default 'active',
  subscription_plan text default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- 3. PROFILES (Extending auth.users)
-- -----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete set null,
  role user_role default 'customer',
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- 4. STORES (Branches)
-- -----------------------------------------------------------------------------
create table stores (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  name text not null,
  type store_type default 'a_la_carte',
  config jsonb default '{}'::jsonb, -- Store specific config like theme, tax rate
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- 5. ZONES & TABLES
-- -----------------------------------------------------------------------------
create table zones (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

create table tables (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid references zones(id) on delete cascade not null,
  store_id uuid references stores(id) on delete cascade not null,
  name text not null,
  qr_code text,
  capacity int default 4,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- 6. MENU SYSTEM
-- -----------------------------------------------------------------------------
create table menu_categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade not null,
  name text not null,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references menu_categories(id) on delete set null,
  store_id uuid references stores(id) on delete cascade not null,
  name text not null,
  description text,
  price decimal(10, 2) not null,
  image_url text,
  is_available boolean default true,
  options jsonb default '[]'::jsonb, -- Variants/Add-ons
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- 7. ORDERING SYSTEM
-- -----------------------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade not null,
  table_id uuid references tables(id) on delete set null,
  customer_id uuid references profiles(id) on delete set null,
  status order_status default 'pending',
  payment_status payment_status default 'pending',
  total_amount decimal(10, 2) default 0.00,
  pax int default 1, -- Number of people (important for Buffet)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  menu_item_id uuid references menu_items(id) on delete set null,
  quantity int default 1,
  price decimal(10, 2) not null, -- Snapshot of price at order time
  notes text,
  options_selected jsonb default '{}'::jsonb,
  status order_status default 'pending', -- Item level status (e.g. delivered)
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------

-- Enable RLS on all tables
alter table tenants enable row level security;
alter table profiles enable row level security;
alter table stores enable row level security;
alter table zones enable row level security;
alter table tables enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Helper function to get current user role
create or replace function get_current_user_role()
returns user_role as $$
begin
  return (select role from profiles where id = auth.uid());
end;
$$ language plpgsql security definer;

-- Helper function to get current tenant
create or replace function get_current_tenant_id()
returns uuid as $$
begin
  return (select tenant_id from profiles where id = auth.uid());
end;
$$ language plpgsql security definer;

-- ---------------------------------------
-- Policies for TENANTS
-- ---------------------------------------
-- Super Admin can see all tenants
create policy "Super Admin can view all tenants"
  on tenants for select
  using ( get_current_user_role() = 'super_admin' );

-- Users can view their own tenant
create policy "Users can view own tenant"
  on tenants for select
  using ( id = get_current_tenant_id() );

-- ---------------------------------------
-- Policies for PROFILES
-- ---------------------------------------
create policy "Users can view their own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Admins can view profiles in their tenant"
  on profiles for select
  using ( 
    get_current_user_role() in ('super_admin', 'store_admin') 
    and (tenant_id = get_current_tenant_id() or get_current_user_role() = 'super_admin')
  );

-- Allow new users to be created (needed for sign up trigger usually, but for direct insert)
create policy "Enable insert for authenticated users only"
  on profiles for insert
  with check ( auth.uid() = id );
  
create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- ---------------------------------------
-- Policies for STORES
-- ---------------------------------------
create policy "View stores"
  on stores for select
  using ( 
    -- Public/Staff/Admin logic
    -- For now: simple check if in same tenant OR super admin
    tenant_id = get_current_tenant_id() 
    or get_current_user_role() = 'super_admin'
    -- Note: End users might need public access to stores via Slug/ID if not logged in? 
    -- Adding a public policy if needed later.
  );

-- ---------------------------------------
-- Policies for MENU (Publicly Accessible)
-- ---------------------------------------
create policy "Public menu categories"
  on menu_categories for select
  using ( true );

create policy "Public menu items"
  on menu_items for select
  using ( true );

-- Staff/Admin can manage menu
create policy "Staff manage menu items"
  on menu_items for all
  using ( 
    exists (
      select 1 from stores 
      where stores.id = menu_items.store_id 
      and stores.tenant_id = get_current_tenant_id()
    )
    and get_current_user_role() in ('store_admin', 'staff')
  );

-- ---------------------------------------
-- Policies for ORDERS
-- ---------------------------------------
-- Customers see their own orders
create policy "Customers view own orders"
  on orders for select
  using ( customer_id = (select id from profiles where id = auth.uid()) );

-- Staff see orders in their store
create policy "Staff view store orders"
  on orders for select
  using (
    exists (
      select 1 from stores 
      where stores.id = orders.store_id 
      and stores.tenant_id = get_current_tenant_id()
    )
    and get_current_user_role() in ('store_admin', 'staff')
  );

-- Customers can create orders (if using auth)
create policy "Customers create orders"
  on orders for insert
  with check ( auth.uid() = customer_id );
  
-- Anonymous orders? (Need to handle guest checkout later)

commit;
