-- FoodLink partner onboarding for the fresh rebuild.
-- Apply after 001_initial_schema.sql and 002_ordering_and_delivery.sql.

create table if not exists public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  requested_role text not null check (requested_role in ('chef','supplier','rider')),
  full_name text not null,
  phone text not null,
  business_name text not null default '',
  location text not null,
  experience text not null default '',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text not null default '',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partner_applications_user_idx
  on public.partner_applications (user_id, created_at desc);
create index if not exists partner_applications_status_idx
  on public.partner_applications (status, created_at asc);

alter table public.partner_applications enable row level security;

drop policy if exists "partner_applications_submit_own" on public.partner_applications;
create policy "partner_applications_submit_own"
  on public.partner_applications for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pending'
    and reviewed_by is null
    and reviewed_at is null
  );

drop policy if exists "partner_applications_read_own_or_admin" on public.partner_applications;
create policy "partner_applications_read_own_or_admin"
  on public.partner_applications for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Approval is a privileged operation. Users cannot approve themselves or change their role.
create or replace function public.review_partner_application(
  p_application_id uuid,
  p_decision text,
  p_admin_note text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_application public.partner_applications%rowtype;
begin
  if auth.uid() is null
     or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'Only an administrator can review partner applications';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'Decision must be approved or rejected';
  end if;

  select * into v_application
  from public.partner_applications
  where id = p_application_id
  for update;

  if not found then
    raise exception 'Partner application not found';
  end if;

  if v_application.status <> 'pending' then
    raise exception 'This application has already been reviewed';
  end if;

  update public.partner_applications
  set status = p_decision,
      admin_note = left(coalesce(p_admin_note, ''), 1000),
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      updated_at = now()
  where id = p_application_id;

  if p_decision = 'approved' then
    update public.profiles
    set role = v_application.requested_role,
        phone = v_application.phone,
        full_name = v_application.full_name,
        updated_at = now()
    where id = v_application.user_id;

    if v_application.requested_role = 'chef' then
      insert into public.vendors (owner_id, business_name, description, vendor_type, is_active)
      values (
        v_application.user_id,
        coalesce(nullif(trim(v_application.business_name), ''), v_application.full_name || '''s Kitchen'),
        'New FoodLink partner. Complete your profile and menu before launch.',
        'chef',
        false
      )
      on conflict (owner_id) do nothing;
    end if;
  end if;
end;
$$;

revoke all on function public.review_partner_application(uuid, text, text) from public;
revoke all on function public.review_partner_application(uuid, text, text) from anon;
grant execute on function public.review_partner_application(uuid, text, text) to authenticated;
