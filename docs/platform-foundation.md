# FoodLink platform foundation

FoodLink uses Firebase, not Supabase.

## Services

- Firebase Authentication: customer sign-up and sign-in.
- Cloud Firestore: profiles, vendor listings, menus, orders, suppliers, partner applications and delivery records.
- Firebase Admin SDK: server-side token verification and trusted order processing.
- Next.js: website and application pages.
- Vercel: hosting and deployment.
- Safaricom Daraja: planned M-Pesa STK Push integration, pending business payment setup.

## First setup

1. Create a Firebase project in https://console.firebase.google.com/.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Create a Cloud Firestore database.
4. Register a Firebase Web App and copy its config into the `NEXT_PUBLIC_FIREBASE_*` environment variables.
5. Generate a Firebase service-account private key and store the complete JSON in the server-only `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable in Vercel.
6. Deploy `firestore.rules` using Firebase Console → Firestore → Rules.
7. Redeploy the website after configuring the environment variables.

## Firestore collections

- `profiles/{uid}`: full name, email, phone, role, verification status.
- `vendors/{vendorId}`: owner ID, business name, description, cuisine, active status.
- `menuItems/{itemId}`: vendor ID, dish, price, photo, preparation time, availability.
- `orders/{orderId}`: customer and vendor IDs, item snapshots, totals, delivery address, status and payment status.
- `supplierProducts/{productId}`: supplier ID, item, unit, price, stock and availability.
- `partnerApplications/{applicationId}`: applicant ID, requested role and review status.
- `deliveryJobs/{jobId}`: order ID, rider ID and delivery status.

## Security

Public sign-up always assigns the customer role. Partner roles and admin permissions must only be assigned by a trusted process. To assign the first admin, set FIREBASE_SERVICE_ACCOUNT_KEY locally to a service-account JSON value and run `node scripts/set-admin-claim.mjs admin@example.com` using the real admin email. Never run this command with an untrusted email. Sign out and sign back in after the claim is set. Orders are created on the server after verifying the Firebase ID token and retrieving menu prices from Firestore. Browser rules deny direct order writes.

Never commit Firebase service-account JSON or put it in a `NEXT_PUBLIC_*` variable.

## Not yet production-ready

The Firebase migration is being prepared on the `rebuild/firebase-v1` branch. A build and full end-to-end tests are still required. M-Pesa STK Push, callback verification, admin partner management, automated rider assignment, supplier purchasing, notifications, refunds, backups and operational monitoring need further work before accepting live payments.
