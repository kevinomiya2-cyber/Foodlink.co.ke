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

1. Use the existing Firebase project `foodlink3-3081a` at https://console.firebase.google.com/.
2. Enable **Authentication → Sign-in method → Email/Password** and **Google**.
3. Create a Cloud Firestore database if one does not exist.
4. Register a Firebase Web App and copy its actual config into the `NEXT_PUBLIC_FIREBASE_*` environment variables in Vercel. The project ID is `foodlink3-3081a`; confirm the actual storage bucket and app IDs in Project settings.
5. Add the production website domain under Authentication → Settings → Authorized domains.
6. Generate a Firebase service-account private key and store the complete JSON in the server-only `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable in Vercel.
7. Deploy `firestore.rules` using Firebase Console → Firestore → Rules.
8. For Android, register package `ke.co.foodlink.app` under Project settings → Your apps, download `google-services.json` into `android/app/`, and add SHA-1/SHA-256 fingerprints for the signing certificate. Re-download the JSON after enabling Google sign-in.
9. Redeploy the website after configuring the environment variables.

## Android app registration\n\nThe web codebase is Next.js; Firebase Android registration is a separate app entry in the same Firebase project. Use the package name `ke.co.foodlink.app` consistently; Android package names cannot be changed after registration. The Firebase Console must register this app and generate `google-services.json` before an Android build can authenticate. Add the SHA-1/SHA-256 fingerprints of the debug and release signing keys to the Android app settings. Enable Google sign-in in Authentication and download a fresh config file so it contains OAuth client details.\n\n## Firestore collections

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
