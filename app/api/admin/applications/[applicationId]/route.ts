import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyBearerToken } from "@/lib/firebase/admin";

export async function POST(request: Request, context: { params: Promise<{ applicationId: string }> }) {
  const user = await verifyBearerToken(request);
  if (!user || user.admin !== true) return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  const { applicationId } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const decision = body && typeof body === "object" ? (body as {decision?:unknown}).decision : null;
  if (decision !== "approved" && decision !== "rejected") return NextResponse.json({ error: "Choose approve or reject." }, { status: 400 });
  try {
    const db = getAdminDb();
    const appRef = db.collection("partnerApplications").doc(applicationId);
    const appSnap = await appRef.get();
    if (!appSnap.exists) return NextResponse.json({ error: "Application not found." }, { status: 404 });
    const application = appSnap.data()!;
    if (application.status !== "pending") return NextResponse.json({ error: "This application has already been reviewed." }, { status: 409 });
    const role = String(application.requestedRole || "");
    if (!["chef","supplier","rider"].includes(role)) return NextResponse.json({ error: "Invalid requested partner role." }, { status: 400 });
    const batch = db.batch();
    batch.update(appRef, { status: decision, reviewedBy: user.uid, reviewedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    if (decision === "approved") {
      const profileRef = db.collection("profiles").doc(String(application.userId));
      batch.update(profileRef, { role, isVerified: true, updatedAt: FieldValue.serverTimestamp() });
      if (role === "chef") {
        const vendorRef = db.collection("vendors").doc();
        batch.set(vendorRef, {
          ownerId: String(application.userId),
          businessName: String(application.businessName || application.fullName || "FoodLink food business"),
          description: String(application.experience || ""),
          cuisineTypes: [],
          isActive: false,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        });
      }
    }
    await batch.commit();
    return NextResponse.json({ ok: true, status: decision });
  } catch {
    return NextResponse.json({ error: "Review could not be saved. Check that the profile exists and Firebase Admin is configured." }, { status: 503 });
  }
}
