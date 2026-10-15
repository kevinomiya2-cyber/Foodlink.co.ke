import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("Firebase Admin is not configured. Add FIREBASE_SERVICE_ACCOUNT_KEY on the server.");
  let account: Record<string, unknown>;
  try {
    account = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY must be valid service-account JSON.");
  }
  if (typeof account.private_key === "string") account.private_key = account.private_key.replace(/\\n/g, "\n");
  return initializeApp({ credential: cert(account as Parameters<typeof cert>[0]) });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export async function verifyBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return null;
  try {
    return await getAdminAuth().verifyIdToken(header.slice(7));
  } catch {
    return null;
  }
}
