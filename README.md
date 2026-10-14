# FOODLINK website starter

A responsive Next.js + TypeScript marketing/marketplace frontend prototype for FOODLINK, the Kenyan food-industry network.

## Run locally

1. Install Node.js 20+.
2. Extract this folder and open a terminal inside it.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:3000`.

## Current status

This is a frontend prototype, not a production marketplace. The meal listings and prices are demo content, and links are placeholders. Login, customer checkout, provider dashboards, supplier purchasing, rider dispatch, Supabase data, and M-Pesa payments are not connected yet. Do not accept real payments or upload sensitive customer documents through this prototype.

## Recommended next build steps

1. Create a Supabase project and configure environment variables.
2. Implement Supabase Auth and role-based profiles.
3. Add vendor and menu tables with Row Level Security policies.
4. Replace sample meal data with live database queries.
5. Build cart, order creation, order status, and admin moderation.
6. Integrate M-Pesa Daraja using server-side routes and verified callbacks.
7. Deploy to Vercel after testing security and mobile responsiveness.

## Brand direction

FOODLINK · ONE NETWORK. EVERY PLATE.
Palette: ink black/green, warm cream, muted gold. Launch geography: Nairobi and Kiambu.
