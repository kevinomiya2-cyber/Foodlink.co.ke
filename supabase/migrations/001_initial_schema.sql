-- FoodLink initial platform schema
-- Apply this file in the Supabase SQL Editor before enabling real customer traffic.
-- All money values are stored in KES as integer cents to avoid floating-point errors.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer','chef','rider','supplier','admin')),
  full_name text not null default '',
  phone text unique,
  email text,
  avatar_url text,
  latitude double precision,
  longitude double precision,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  jwt_role text;
  app_role text;
begin
  jwt_role := coalesce(current_setting('request.jwt.claim.role', true), '');
  app_role := coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '');
  if jwt_role <> 'service_role' and app_role <> 'admin' then
    if new.role is distinct from old.role then
      raise exception 'Only an administrator can change account roles';
    end if;
    if new.is_verified is distinct from old.is_verified then
      raise exception 'Only an administrator can change verification status';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges
before update on public.profiles
for each row execute procedure public.protect_profile_privileges();

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  business_name text not null,
  description text not null default '',
  vendor_type text not null default 'chef' check (vendor_type in ('chef','restaurant','caterer','street_vendor')),
  cuisine_types text[] not null default '{}',
  cover_image_url text,
  food_safety_cert_url text,
  is_active boolean not null default false,
  rating numeric(3,2) not null default 0 check (rating between 0 and 5),
  total_orders integer not null default 0 check (total_orders >= 0),
  commission_rate numeric(5,2) not null default 15.00 check (commission_rate between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  name text not null,
  description text not null default '',
  category text not null default 'Main',
  price_kes integer not null check (price_kes >= 0),
  image_url text,
  is_available boolean not null default true,
  preparation_minutes integer not null default 30 check (preparation_minutes between 1 and 1440),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.supplier_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text not null default '',
  category text not null default 'Ingredients',
  unit text not null default 'piece',
  price_kes integer not null check (price_kes >= 0),
  stock_quantity numeric(12,3) not null default 0 check (stock_quantity >= 0),
  image_url text,
  is_available boolean not null default true,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  customer_id uuid not null references public.profiles(id),
  vendor_id uuid not null references public.vendors(id),
  status text not null default 'pending' check (status in ('pending','accepted','preparing','ready','picked_up','delivered','cancelled','refunded')),
  subtotal_kes integer not null check (subtotal_kes >= 0),
  delivery_fee_kes integer not null default 0 check (delivery_fee_kes >= 0),
  service_fee_kes integer not null default 0 check (service_fee_kes >= 0),
  total_kes integer not null check (total_kes >= 0),
  delivery_address text not null,
  delivery_latitude double precision,
  delivery_longitude double precision,
  customer_note text not null default '',
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','failed','refunded')),
  payment_provider text,
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total_kes = subtotal_kes + delivery_fee_kes + service_fee_kes)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  item_name text not null,
  unit_price_kes integer not null check (unit_price_kes >= 0),
  quantity integer not null check (quantity between 1 and 1000),
  line_total_kes integer not null check (line_total_kes = unit_price_kes * quantity),
  created_at timestamptz not null default now()
);

create table if not exists public.delivery_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  rider_id uuid references public.profiles(id) on delete set null,
  status text not null default 'awaiting_rider' check (status in ('awaiting_rider','assigned','at_vendor','picked_up','delivered','failed','cancelled')),
  pickup_note text not null default '',
  delivery_note text not null default '',
  proof_image_url text,
  assigned_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.supplier_orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  buyer_id uuid not null references public.profiles(id),
  supplier_id uuid not null references public.profiles(id),
  status text not null default 'pending' check (status in ('pending','accepted','packed','dispatched','delivered','cancelled')),
  subtotal_kes integer not null check (subtotal_kes >= 0),
  delivery_fee_kes integer not null default 0 check (delivery_fee_kes >= 0),
  total_kes integer not null check (total_kes = subtotal_kes + delivery_fee_kes),
  delivery_address text not null,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','failed','refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.supplier_order_items (
  id uuid primary key default gen_random_uuid(),
  supplier_order_id uuid not null references public.supplier_orders(id) on delete cascade,
  product_id uuid references public.supplier_products(id) on delete set null,
  item_name text not null,
  unit_price_kes integer not null check (unit_price_kes >= 0),
  quantity numeric(12,3) not null check (quantity > 0),
  line_total_kes integer not null check (line_total_kes >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  score integer not null check (score between 1 and 5),
  review text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists vendors_active_idx on public.vendors (is_active, business_name);
create index if not exists menu_items_vendor_available_idx on public.menu_items (vendor_id, is_available);
create index if not exists supplier_products_supplier_idx on public.supplier_products (supplier_id, is_available);
create index if not exists orders_customer_created_idx on public.orders (customer_id, created_at desc);
create index if not exists orders_vendor_status_idx on public.orders (vendor_id, status, created_at desc);
create index if not exists delivery_jobs_rider_status_idx on public.delivery_jobs (rider_id, status);
create index if not exists supplier_orders_buyer_idx on public.supplier_orders (buyer_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.vendors enable row level security;
alter table public.menu_items enable row level security;
alter table public.supplier_products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.delivery_jobs enable row level security;
alter table public.supplier_orders enable row level security;
alter table public.supplier_order_items enable row level security;
alter table public.ratings enable row level security;

-- Profiles: users can see and edit only their own basic profile.
create policy "profiles_select_own" on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "profiles_update_own" on public.profiles for update to authenticated
using (id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check (id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Public discovery only exposes active vendors and available menu items.
create policy "vendors_public_active" on public.vendors for select to anon, authenticated
using (is_active = true or owner_id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "vendors_owner_insert" on public.vendors for insert to authenticated
with check (owner_id = (select auth.uid()) and (select role from public.profiles where id = (select auth.uid())) in ('chef'));
create policy "vendors_owner_update" on public.vendors for update to authenticated
using (owner_id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check (owner_id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "menu_items_public_available" on public.menu_items for select to anon, authenticated
using (
  is_available = true and exists (
    select 1 from public.vendors v where v.id = vendor_id and v.is_active = true
  )
  or exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid()))
  or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "menu_items_owner_insert" on public.menu_items for insert to authenticated
with check (exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid())));
create policy "menu_items_owner_update" on public.menu_items for update to authenticated
using (exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid())) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check (exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid())) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "menu_items_owner_delete" on public.menu_items for delete to authenticated
using (exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid())) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "supplier_products_public_available" on public.supplier_products for select to anon, authenticated
using (is_available = true or supplier_id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "supplier_products_owner_insert" on public.supplier_products for insert to authenticated
with check (supplier_id = (select auth.uid()) and (select role from public.profiles where id = (select auth.uid())) = 'supplier');
create policy "supplier_products_owner_update" on public.supplier_products for update to authenticated
using (supplier_id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check (supplier_id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "supplier_products_owner_delete" on public.supplier_products for delete to authenticated
using (supplier_id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Orders and payment totals are written only by trusted server-side code using the service role.
create policy "orders_customer_or_vendor_select" on public.orders for select to authenticated
using (
  customer_id = (select auth.uid())
  or exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid()))
  or exists (select 1 from public.delivery_jobs d where d.order_id = id and d.rider_id = (select auth.uid()))
  or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
create policy "order_items_participant_select" on public.order_items for select to authenticated
using (exists (
  select 1 from public.orders o
  left join public.vendors v on v.id = o.vendor_id
  left join public.delivery_jobs d on d.order_id = o.id
  where o.id = order_id and (
    o.customer_id = (select auth.uid()) or v.owner_id = (select auth.uid())
    or d.rider_id = (select auth.uid())
    or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
));

create policy "delivery_jobs_rider_or_admin_select" on public.delivery_jobs for select to authenticated
using (rider_id = (select auth.uid()) or exists (
  select 1 from public.orders o join public.vendors v on v.id = o.vendor_id
  where o.id = order_id and (o.customer_id = (select auth.uid()) or v.owner_id = (select auth.uid()))
) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "delivery_jobs_rider_update" on public.delivery_jobs for update to authenticated
using (rider_id = (select auth.uid()))
with check (rider_id = (select auth.uid()));

create policy "supplier_orders_participant_select" on public.supplier_orders for select to authenticated
using (buyer_id = (select auth.uid()) or supplier_id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "supplier_order_items_participant_select" on public.supplier_order_items for select to authenticated
using (exists (
  select 1 from public.supplier_orders so
  where so.id = supplier_order_id
  and (so.buyer_id = (select auth.uid()) or so.supplier_id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)));

create policy "ratings_public_read" on public.ratings for select to anon, authenticated using (true);
create policy "ratings_customer_insert" on public.ratings for insert to authenticated
with check (
  customer_id = (select auth.uid()) and exists (
    select 1 from public.orders o where o.id = order_id and o.customer_id = (select auth.uid()) and o.status = 'delivered'
  )
);
