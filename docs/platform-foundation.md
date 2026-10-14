# FoodLink platform foundation

## What is implemented
- Supabase Auth browser/server helpers, confirmation callback, sign-in/sign-up, sign-out, and protected dashboard.
- Marketplace that reads active vendors and available menu items from Supabase.
- Cart and checkout that creates unpaid orders through a database function which recalculates prices on the server.
- Vendor order list and restricted status transitions.
- Database tables and Row Level Security for profiles, vendors, menus, supplier products, food orders, delivery jobs, supplier orders, and ratings.

## 1. Configure Supabase
Create a project in Supabase and keep its database password somewhere safe.

### If the initial schema has never been run
Open Supabase Dashboard → SQL Editor, paste and run `supabase/migrations/001_initial_schema.sql`.

### If an earlier version of migration 001 has already been run
Run `supabase/migrations/002_ordering_and_delivery.sql` only. Do not rerun the older migration from the previous version because its table and policy creation statements are not all idempotent.

The second migration adds order placement and vendor status functions, fixes a non-recursive order visibility policy, and removes direct rider updates.

## 2. Configure Vercel
In Vercel → FoodLink project → Settings → Environment Variables, add these for Production, Preview, and Development as appropriate:
- `NEXT_PUBLIC_SUPABASE_URL`: project URL from Supabase Project Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: publishable/anon key from Supabase Project Settings → API

Redeploy after changing environment variables.

## 3. Configure Supabase Auth redirects
In Supabase Authentication URL Configuration:
- Set Site URL to the exact production website origin.
- Add the production origin plus `/auth/callback` to Redirect URLs.
- Add any Vercel preview origin only if you intend to test sign-in there.

## 4. First test
1. Create a customer account and confirm the email if confirmation is enabled.
2. Confirm the profile row appears in `public.profiles`.
3. Create a test vendor profile through an administrator-approved account, set it active, and add an available menu item.
4. Sign in as a customer, add menu items from one vendor to the cart, and place a test order.
5. Check `public.orders`, `public.order_items`, and `public.delivery_jobs`.
6. Sign in as the vendor and test accept → preparing → ready.

## Security and launch limits
- New signups are always customers. Do not let users grant themselves chef, rider, supplier, or admin privileges.
- Role upgrades and vendor activation must be administrator-controlled.
- Order totals are calculated in the database. Browser-submitted prices are ignored.
- The current MVP stores orders as unpaid. Delivery fee is set to zero until the launch area's delivery pricing is configured.
- M-Pesa, automatic rider assignment, notifications, supplier checkout, refunds, dispute management, and production monitoring are not yet complete.
- Never expose a Supabase service-role key in `NEXT_PUBLIC_*` variables, client code, GitHub, or chat.
- Do not accept real orders or payments until database setup, deployment, auth redirects, and end-to-end tests pass.
