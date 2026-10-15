import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyBearerToken } from "@/lib/firebase/admin";

const allowed: Record<string,string[]> = { assigned:["at_vendor"], at_vendor:["picked_up"], picked_up:["delivered"] };

export async function POST(request: Request, context: { params: Promise<{ jobId: string }> }) {
  const user = await verifyBearerToken(request);
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { jobId } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const status = body && typeof body === "object" ? (body as {status?:unknown}).status : null;
  if (typeof status !== "string" || !["at_vendor","picked_up","delivered"].includes(status)) return NextResponse.json({ error: "Unsupported delivery status." }, { status: 400 });
  try {
    const db = getAdminDb();
    const jobRef = db.collection("deliveryJobs").doc(jobId);
    const jobSnap = await jobRef.get();
    if (!jobSnap.exists || jobSnap.data()?.riderId !== user.uid) return NextResponse.json({ error: "This delivery is not assigned to your account." }, { status: 403 });
    const current = String(jobSnap.data()?.status || "");
    if (!(allowed[current] || []).includes(status)) return NextResponse.json({ error: "That delivery status transition is not allowed." }, { status: 400 });
    const batch = db.batch();
    batch.update(jobRef, { status, updatedAt: FieldValue.serverTimestamp() });
    if (status === "delivered" && jobSnap.data()?.orderId) batch.update(db.collection("orders").doc(String(jobSnap.data()?.orderId)), { status: "delivered", updatedAt: FieldValue.serverTimestamp() });
    await batch.commit();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delivery service is not configured." }, { status: 503 });
  }
}
