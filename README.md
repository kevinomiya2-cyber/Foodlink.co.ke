# FOODLINK · One Network. Every Plate.

FoodLink is a Kenyan food-tech platform concept connecting customers, chefs and food businesses, suppliers, and delivery partners, beginning in Nairobi and Kiambu.

## Current build
- Responsive marketing homepage.
- Supabase email signup/sign-in and protected account dashboard.
- Live marketplace reads active vendors and available menu items from Supabase.
- Cart and server-validated order creation for a single vendor per order.
- Vendor order management: accept, prepare, mark ready, or cancel.
- Supabase schema with Row Level Security for profiles, vendors, menu items, supplier products, food orders, delivery jobs, supplier orders, and ratings.

## Deploy and configure
1. Install Node.js 20+ and run `npm install`.
2. Copy `.env.example` to `.env.local` and add the Supabase URL and publishable/anon key.
3. Apply `supabase/migrations/001_initial_schema.sql` in a new Supabase project. If an earlier version of 001 was already applied, run only `supabase/migrations/002_ordering_and_delivery.sql`.
4. Configure the Supabase Auth Site URL and `/auth/callback` redirect.
5. Add the environment variables to the Vercel project and redeploy.
6. Follow [docs/platform-foundation.md](docs/platform-foundation.md) to test.

## Not production-ready yet
This is a staged MVP. Orders are created as unpaid; online payment, M-Pesa Daraja, configurable delivery pricing, automatic rider assignment, rider and supplier workflows, admin tools, notifications, refunds, and full end-to-end testing remain unfinished. Do not accept real payments until those pieces and deployment checks are complete.

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.
