# FoodLink platform foundation

## What is in the rebuild branch

- Supabase Auth helpers, email sign-up/sign-in, confirmation callback, and protected account.
- Public marketplace with a sample catalogue fallback while no live vendors are approved.
- Cart and order placement using a database function that recalculates menu prices.
- Chef menu editor and vendor order fulfilment.
- Supplier product catalogue with availability controls.
- Rider workspace with constrained status transitions through a database function.
- Partner application form and admin application review.
- Row Level Security for customer, partner, order, supplier, and delivery records.

## 1. Create a fresh Supabase project

Open Supabase Dashboard and create a new project. Keep the database password secure. Then open **SQL Editor** and run, in this exact order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_ordering_and_delivery.sql`
3. `supabase/migrations/003_partner_applications.sql`

Run all three for a new database. Do not skip migration 003: the partner application form and review screen depend on it.

## 2. Configure environment variables

In the website hosting dashboard, add the following to Production, Preview, and Development environments as needed:

- `NEXT_PUBLIC_SUPABASE_URL`: project URL from Supabase project settings.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: publishable key (or legacy anon key) from Supabase API settings.

Never use the Supabase `service_role` key as a public variable. If a server-side integration later needs privileged access, keep that secret in a server-only environment variable and validate every request.

Redeploy after environment changes.

## 3. Configure authentication redirects

In Supabase **Authentication → URL Configuration**:

- Set the Site URL to the exact deployed website origin.
- Add the deployed origin plus `/auth/callback` to allowed Redirect URLs.
- Add preview URLs only when they are needed for testing.

## 4. Create the first administrator safely

The admin review interface checks the signed-in user's Supabase Auth `app_metadata.role` for `admin`. A user must not be allowed to set this value through a public signup form. Set it only through a trusted administrator process using the Supabase dashboard or a secured server-side administrative tool. Do not publish service-role credentials.

## 5. First acceptance test

1. Register a customer and confirm email if enabled.
2. Confirm a matching row exists in `public.profiles`.
3. Open `/workspace` and `/marketplace`.
4. Submit a partner application at `/apply`.
5. Review it at `/admin/applications` using the properly provisioned admin account.
6. For a chef approval, complete and activate the vendor profile before expecting public listings.
7. Add a menu item at `/chef/menu` and test customer checkout.
8. Assign a delivery job to a test rider before testing `/rider`.
9. Confirm order, order item, and delivery job records in Supabase.
10. Test denied access: customers must not edit roles, see another customer's order, or access partner/admin tools.

## Launch limits

- M-Pesa is not enabled and order records are unpaid.
- A live Daraja integration needs the business payment setup, API credentials, HTTPS callback, signature/metadata validation, idempotent callback handling, and reconciliation.
- Rider assignment and vendor activation require an administrator workflow.
- Supplier order purchasing, customer order history polish, email notifications, delivery fees, refunds, audit logs, monitoring, backups, and full production testing remain outstanding.
- Do not accept real orders or payments until all setup and end-to-end tests pass.
