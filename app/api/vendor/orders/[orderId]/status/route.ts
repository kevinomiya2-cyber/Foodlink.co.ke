import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyBearerToken } from "@/lib/firebase/admin";

const allowed: Record<string,string[]> = {
  pending: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready"],
};

export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const user = await verifyBearerToken(request);
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { orderId } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const status = body && typeof body === "object" ? (body as {status?:unknown}).status : null;
  if (typeof status !== "string" || !["accepted","preparing","ready","cancelled"].includes(status)) return NextResponse.json({ error: "Unsupported order status." }, { status: 400 });
  try {
    const db = getAdminDb();
    const ref = db.collection("orders").doc(orderId);
    const snap = await ref.get();
    if (!snap.exists || snap.data()?.vendorOwnerId !== user.uid) return NextResponse.json({ error: "You cannot update this order." }, { status: 403 });
    const current = String(snap.data()?.status || "");
    if (!(allowed[current] || []).includes(status)) return NextResponse.json({ error: "That order status transition is not allowed." }, { status: 400 });
    await ref.update({ status, updatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Order service is not configured." }, { status: 503 });
  }
}
