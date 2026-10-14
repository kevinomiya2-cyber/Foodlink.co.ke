-- FoodLink incremental ordering and security update.
-- Run this migration if 001_initial_schema.sql was already applied before order functions were added.
-- Incremental migration for projects that already applied an earlier version of 001.
-- Keep order visibility non-recursive: orders policy must not query delivery_jobs,
-- because delivery_jobs policies already query orders.
drop policy if exists "orders_customer_or_vendor_select" on public.orders;
create policy "orders_customer_or_vendor_select" on public.orders for select to authenticated
using (
  customer_id = (select auth.uid())
  or exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid()))
  or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Riders must use the constrained function below instead of updating arbitrary job columns.
drop policy if exists "delivery_jobs_rider_update" on public.delivery_jobs;

create or replace function public.set_delivery_job_status(
  p_job_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rider_id uuid;
  v_current_status text;
  v_order_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must sign in';
  end if;

  if p_status not in ('at_vendor', 'picked_up', 'delivered') then
    raise exception 'That delivery status is not allowed';
  end if;

  select d.rider_id, d.status, d.order_id
  into v_rider_id, v_current_status, v_order_id
  from public.delivery_jobs d
  where d.id = p_job_id
  for update;

  if not found or v_rider_id <> auth.uid() then
    raise exception 'Delivery job not found for this rider';
  end if;

  if (v_current_status = 'assigned' and p_status <> 'at_vendor')
     or (v_current_status = 'at_vendor' and p_status <> 'picked_up')
     or (v_current_status = 'picked_up' and p_status <> 'delivered') then
    raise exception 'Invalid delivery status transition';
  end if;

  update public.delivery_jobs
  set status = p_status,
      picked_up_at = case when p_status = 'picked_up' then now() else picked_up_at end,
      delivered_at = case when p_status = 'delivered' then now() else delivered_at end,
      updated_at = now()
  where id = p_job_id;

  if p_status = 'picked_up' then
    update public.orders set status = 'picked_up', updated_at = now() where id = v_order_id;
  elsif p_status = 'delivered' then
    update public.orders set status = 'delivered', updated_at = now() where id = v_order_id;
  end if;
end;
$$;

revoke all on function public.set_delivery_job_status(uuid, text) from public;
revoke all on function public.set_delivery_job_status(uuid, text) from anon;
grant execute on function public.set_delivery_job_status(uuid, text) to authenticated;

-- MVP order placement: prices and totals are calculated inside the database, never trusted from the browser.
-- Delivery fee is deliberately zero until the launch area's delivery pricing is configured.
create or replace function public.place_food_order(
  p_vendor_id uuid,
  p_delivery_address text,
  p_customer_note text default '',
  p_items jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer_id uuid := auth.uid();
  v_order_id uuid;
  v_subtotal integer := 0;
  v_delivery_fee integer := 0;
  v_service_fee integer := 0;
  v_item jsonb;
  v_menu public.menu_items%rowtype;
  v_quantity integer;
  v_menu_id uuid;
  v_vendor_owner uuid;
begin
  if v_customer_id is null then
    raise exception 'You must sign in before placing an order';
  end if;

  if p_delivery_address is null or length(trim(p_delivery_address)) < 8 then
    raise exception 'Enter a complete delivery address';
  end if;

  if jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'Your cart must contain between 1 and 50 line items';
  end if;
  if jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 50 then
    raise exception 'Your cart must contain between 1 and 50 line items';
  end if;

  select v.owner_id into v_vendor_owner
  from public.vendors v
  where v.id = p_vendor_id and v.is_active = true;

  if not found then
    raise exception 'This food business is not currently accepting orders';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    begin
      v_menu_id := (v_item ->> 'menu_item_id')::uuid;
      v_quantity := (v_item ->> 'quantity')::integer;
    exception when others then
      raise exception 'A cart item is invalid';
    end;

    if v_quantity < 1 or v_quantity > 100 then
      raise exception 'Each item quantity must be between 1 and 100';
    end if;

    select mi.* into v_menu
    from public.menu_items mi
    where mi.id = v_menu_id
      and mi.vendor_id = p_vendor_id
      and mi.is_available = true
    for share;

    if not found then
      raise exception 'A menu item is no longer available. Refresh the marketplace and try again';
    end if;

    v_subtotal := v_subtotal + (v_menu.price_kes * v_quantity);
  end loop;

  insert into public.orders (
    customer_id, vendor_id, status, subtotal_kes, delivery_fee_kes,
    service_fee_kes, total_kes, delivery_address, customer_note, payment_status
  ) values (
    v_customer_id, p_vendor_id, 'pending', v_subtotal, v_delivery_fee,
    v_service_fee, v_subtotal + v_delivery_fee + v_service_fee,
    trim(p_delivery_address), coalesce(left(p_customer_note, 1000), ''), 'unpaid'
  ) returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_menu_id := (v_item ->> 'menu_item_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;

    select mi.* into v_menu
    from public.menu_items mi
    where mi.id = v_menu_id
      and mi.vendor_id = p_vendor_id
      and mi.is_available = true;

    insert into public.order_items (
      order_id, menu_item_id, item_name, unit_price_kes, quantity, line_total_kes
    ) values (
      v_order_id, v_menu.id, v_menu.name, v_menu.price_kes, v_quantity,
      v_menu.price_kes * v_quantity
    );
  end loop;

  insert into public.delivery_jobs (order_id, status)
  values (v_order_id, 'awaiting_rider');

  return v_order_id;
end;
$$;

revoke all on function public.place_food_order(uuid, text, text, jsonb) from public;
revoke all on function public.place_food_order(uuid, text, text, jsonb) from anon;
grant execute on function public.place_food_order(uuid, text, text, jsonb) to authenticated;

-- Vendors may move only their own orders through the fulfilment stages.
create or replace function public.set_vendor_order_status(
  p_order_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_id uuid;
  v_current_status text;
begin
  if auth.uid() is null then
    raise exception 'You must sign in';
  end if;

  if p_status not in ('accepted', 'preparing', 'ready', 'cancelled') then
    raise exception 'That order status is not allowed';
  end if;

  select v.owner_id, o.status
  into v_owner_id, v_current_status
  from public.orders o
  join public.vendors v on v.id = o.vendor_id
  where o.id = p_order_id
  for update of o;

  if not found or v_owner_id <> auth.uid() then
    raise exception 'Order not found for your food business';
  end if;

  if v_current_status not in ('pending', 'accepted', 'preparing', 'ready') then
    raise exception 'This order can no longer be changed';
  end if;

  if p_status = 'preparing' and v_current_status not in ('accepted', 'preparing') then
    raise exception 'Accept the order before preparing it';
  end if;

  if p_status = 'ready' and v_current_status not in ('preparing', 'ready') then
    raise exception 'Mark the order as preparing before marking it ready';
  end if;

  if p_status = 'accepted' and v_current_status <> 'pending' then
    raise exception 'Only pending orders can be accepted';
  end if;

  update public.orders
  set status = p_status, updated_at = now()
  where id = p_order_id;
end;
$$;

revoke all on function public.set_vendor_order_status(uuid, text) from public;
revoke all on function public.set_vendor_order_status(uuid, text) from anon;
grant execute on function public.set_vendor_order_status(uuid, text) to authenticated;

