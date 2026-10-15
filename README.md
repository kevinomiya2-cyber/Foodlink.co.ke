# FoodLink

FoodLink is a Kenyan food-tech platform connecting customers, chefs and food businesses, suppliers, and delivery partners.

## Stack

- Next.js 15 + React 19
- Firebase Authentication
- Cloud Firestore
- Firebase Admin SDK for trusted server-side order processing
- Vercel hosting
- Safaricom Daraja planned for M-Pesa STK Push after business onboarding

## Firebase setup

1. Create a Firebase project at https://console.firebase.google.com/.
2. In **Authentication → Sign-in method**, enable **Email/Password**.
3. In **Firestore Database**, create a database in production mode.
4. Add a Web App under **Project settings → General → Your apps** and copy its config into the `NEXT_PUBLIC_FIREBASE_*` environment variables.
5. In **Project settings → Service accounts**, create a private key. Store its full JSON as the server-only `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable in Vercel. Never commit the key or expose it with a `NEXT_PUBLIC_` prefix.
6. Deploy the Firestore rules from `firestore.rules` in Firebase Console → Firestore → Rules, or run `firebase deploy --only firestore:rules` after installing and logging in to the Firebase CLI.
7. Add the same environment variables to Vercel Production, Preview, and Development as needed, then redeploy.

## Local development

- Install Node.js 20+
- Run `npm install`
- Copy `.env.example` to `.env.local` and replace all placeholders
- Run `npm run dev`

## Data model

- `profiles/{uid}`: name, email, phone, role, verification state
- `vendors/{vendorId}`: ownerId, business details, active state
- `menuItems/{itemId}`: vendorId, name, category, priceKes, photo URL, preparation time, availability
- `orders/{orderId}`: customerId, vendorId, vendorOwnerId, item snapshots, totals, address, status, payment status
- `supplierProducts/{productId}`: supplierId, name, unit, price, stock and availability
- `partnerApplications/{applicationId}`: userId, requested role, business/contact details and review status
- `deliveryJobs/{jobId}`: orderId, riderId, status and delivery notes

## Security notes

- Public signup always creates a customer account. Users cannot self-assign partner or admin roles.
- Order creation and price calculations run server-side through Firebase Admin, not from browser-submitted prices.
- Firestore rules block browser-side writes to orders and reserve role changes, vendor activation, and delivery-job assignment for administrators.
- Admin claims must be set only by a trusted server-side administrative process.
- Never store M-Pesa consumer secrets, passkeys, or Firebase service-account credentials in client code.

## Launch status

Firebase replaces Supabase in this branch. This is not yet a verified production launch: configure the Firebase project, deploy rules, and run build plus end-to-end tests. M-Pesa STK Push, payment callback validation, notifications, admin provisioning, rider dispatch, and operational testing remain before accepting live payments or promising delivery.
