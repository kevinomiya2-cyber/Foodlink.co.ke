# FoodLink platform foundation

## 1. Create the Supabase project
Create a project in Supabase and keep its database password somewhere safe.

## 2. Apply the database schema
Open Supabase Dashboard → SQL Editor, paste and run:
`supabase/migrations/001_initial_schema.sql`

This creates profiles, vendors, menus, supplier products, food orders, order items, delivery jobs, supplier orders, and ratings with Row Level Security enabled.

## 3. Configure local environment
Copy `.env.example` to `.env.local` and fill in values from Supabase Project Settings → API.

- `NEXT_PUBLIC_SUPABASE_URL`: project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: publishable/anon key, safe to expose when RLS is configured
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key for trusted API routes; never put it in a browser bundle or commit it

## 4. Important security boundaries
- New signups are always created as `customer`. Account role upgrades must be approved by an administrator.
- Profile role and verification status are protected by a database trigger.
- Public discovery is limited to active vendors and available listings.
- Orders and payment totals must be created/verified server-side. Do not allow browsers to write their own order totals or mark payments as paid.
- Never store M-Pesa secrets in client code. Payment callbacks must be verified before updating payment status.

## Current state
This is the database foundation, not a finished production marketplace. Apply and test this migration in a fresh Supabase project before adding real users. Authentication screens, server-side order APIs, M-Pesa Daraja, notifications, and operational dashboards are subsequent implementation steps.
