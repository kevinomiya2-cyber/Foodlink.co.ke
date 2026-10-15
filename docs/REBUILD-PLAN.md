# FoodLink rebuild plan

FoodLink is being rebuilt as a Kenyan food-industry marketplace, starting in Nairobi and Kiambu. The design system remains premium cream, forest green and gold.

## Platform modules

1. Public website: homepage, menu/marketplace, contact, policies, help.
2. Authentication: email signup/sign-in, email confirmation, protected account.
3. Customer: browse meals, single-vendor cart, checkout, order history and status.
4. Food partners: apply for approval, create a vendor profile, manage menus and fulfilment.
5. Suppliers: partner approval, product catalogue, stock and supplier orders.
6. Riders: partner approval, assigned delivery jobs and constrained status changes.
7. Administration: approve partners, activate vendors, moderate listings, review orders and manage platform settings.
8. Payments: M-Pesa Daraja STK Push only after the business shortcode/number and credentials are provisioned; verify callbacks server-side before marking an order paid.
9. Operations: validation, audit logs, error monitoring, backups, privacy and end-to-end launch checks.

## Safe rebuild approach

- Work on branch `rebuild/foodlink-v1`; do not overwrite `main` until a production build and acceptance checks pass.
- Create a new Supabase project, then run migrations in numeric order.
- Configure Auth redirect URLs and the two public Supabase environment variables in the deployment host.
- Keep service-role keys, Daraja secrets and passkeys in server-only environment variables. Never put secrets in client code, public environment variables, screenshots, or chat.
- Do not enable live payments until callbacks, duplicate callbacks, incorrect amounts, timeouts, cancellation, and failed transactions have been tested.

## Current scope of this branch

The repository already contains a Next.js/Supabase foundation for authentication, public food discovery, customer order placement, vendor order status changes, and delivery data structures. This rebuild branch adds the partner application workflow and a migration to support administrator review.

The repository changes alone cannot recreate a deleted Supabase cloud project, set deployment secrets, register a Safaricom business payment channel, or prove the production deployment is healthy. Those require account-owner actions and live testing.
