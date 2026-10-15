import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const publicConfig = {
    firebaseApiKeyConfigured: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    firebaseProjectIdConfigured: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    firebaseAppIdConfigured: Boolean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
    firebaseAdminConfigured: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY),
  };
  const missing = Object.values(publicConfig).some(value => !value);
  if (missing) {
    return NextResponse.json({
      status: "needs_configuration",
      message: "FoodLink is running, but Firebase configuration is incomplete.",
      checks: { websiteServer: "ok", ...publicConfig, firestoreConnection: "not_checked" },
      nextStep: "Add the Firebase Web App settings and server-only FIREBASE_SERVICE_ACCOUNT_KEY in your hosting environment, then redeploy."
    }, { status: 503 });
  }
  try {
    await getAdminDb().collection("_foodlinkHealth").doc("probe").get();
    return NextResponse.json({
      status: "connected",
      message: "FoodLink can reach Cloud Firestore using Firebase Admin.",
      checks: { websiteServer: "ok", ...publicConfig, firestoreConnection: "ok" },
      nextStep: "Now test account creation, sign-in, menu reads, order creation and role permissions separately."
    });
  } catch {
    return NextResponse.json({
      status: "connection_error",
      message: "Firebase values are present, but the server could not connect to Firestore.",
      checks: { websiteServer: "ok", ...publicConfig, firestoreConnection: "failed" },
      nextStep: "Check the service-account JSON, its project_id, the Firestore database, and the Vercel environment. Redeploy after fixing values."
    }, { status: 503 });
  }
}
