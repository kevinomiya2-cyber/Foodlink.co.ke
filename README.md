# FOODLINK · One Network. Every Plate.

FoodLink is a Kenyan food-tech marketplace connecting customers, chefs and restaurants, ingredient suppliers, and delivery partners. The initial launch area is Nairobi and Kiambu.

## Platform modules in this rebuild branch

- Responsive premium website and public food marketplace.
- Email sign-up/sign-in through Supabase Auth.
- Customer order placement with server/database-validated prices and single-vendor checkout.
- Chef menu management and vendor order fulfilment.
- Supplier product catalogue with stock and price fields.
- Rider delivery workspace with restricted delivery-status transitions.
- Partner applications for chefs, suppliers, and riders.
- Administrator review of partner applications.
- Row Level Security across user, vendor, menu, supplier, order, and delivery data.

## Rebuild branch

The work is on `rebuild/foodlink-v1`. Review it before merging into `main`:

https://github.com/kevinomiya2-cyber/Foodlink.co.ke/tree/rebuild/foodlink-v1

## Fresh setup

1. Create a new Supabase project and save the database password securely.
2. Open Supabase **SQL Editor** and run these files in this order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_ordering_and_delivery.sql`
   - `supabase/migrations/003_partner_applications.sql`
3. In Supabase **Authentication → URL Configuration**, set the production Site URL and add the production `/auth/callback` URL to allowed redirects.
4. In the deployment host (for example, Vercel), add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the value can be the Supabase publishable key when using the current dashboard)
5. Redeploy after environment variables are saved.
6. Open `/login`, create a customer account, confirm email if enabled, sign in, and test `/workspace`.
7. Test partner application and role workflows before accepting real orders.

For local development, install Node.js 20+, run `npm install`, copy `.env.example` to `.env.local`, fill in the public Supabase values, then run `npm run dev`.

## Critical launch limits

This branch is a staged rebuild, not a verified production launch. The deleted cloud database must be recreated and the migrations must be applied by the account owner. A deployment build and real end-to-end tests are still required.

- Orders remain unpaid. M-Pesa Daraja STK Push is not enabled.
- Live M-Pesa requires a properly registered business payment channel, Daraja credentials, a public HTTPS callback endpoint, server-side callback validation, and reconciliation tests.
- Vendor activation and rider assignment remain administrator-controlled operations.
- Email delivery, customer order history polish, supplier purchasing, notifications, refunds, delivery pricing, monitoring, backups, and production acceptance testing need completion before launch.
- Never place a Supabase service-role key, Daraja consumer secret, or M-Pesa passkey in a `NEXT_PUBLIC_*` variable, browser code, or GitHub.
