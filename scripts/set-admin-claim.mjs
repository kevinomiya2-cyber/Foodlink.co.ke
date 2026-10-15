import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const email = process.argv[2]?.trim().toLowerCase();
const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!email || !raw) {
  console.error("Usage: FIREBASE_SERVICE_ACCOUNT_KEY='<service-account-json>' node scripts/set-admin-claim.mjs admin@example.com");
  process.exit(1);
}
const serviceAccount = JSON.parse(raw);
if (typeof serviceAccount.private_key === "string") serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
const app = getApps()[0] || initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth(app);
const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: true });
console.log("Administrator claim assigned to " + email + ". Sign out and sign in again to refresh the ID token.");
