import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyBearerToken } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await verifyBearerToken(request);
  if (!user) return NextResponse.json({ error: "Sign in before placing an order." }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid order details." }, { status: 400 });
  const input = body as { vendorId?: unknown; deliveryAddress?: unknown; customerNote?: unknown; items?: unknown };
  if (typeof input.vendorId !== "string" || typeof input.deliveryAddress !== "string" || input.deliveryAddress.trim().length < 8 || !Array.isArray(input.items) || input.items.length < 1 || input.items.length > 50) {
    return NextResponse.json({ error: "Add food to your cart and enter a complete delivery address." }, { status: 400 });
  }
  const requested = input.items.map(entry => {
    if (!entry || typeof entry !== "object") return null;
    const item = entry as { menuItemId?: unknown; quantity?: unknown };
    if (typeof item.menuItemId !== "string" || typeof item.quantity !== "number" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) return null;
    return { id: item.menuItemId, quantity: item.quantity };
  });
  if (requested.some(x => x === null) || new Set(requested.map(x => x?.id)).size !== requested.length) return NextResponse.json({ error: "One or more cart items are invalid or duplicated." }, { status: 400 });

  try {
    const db = getAdminDb();
    const vendorRef = db.collection("vendors").doc(input.vendorId);
    const vendorSnap = await vendorRef.get();
    if (!vendorSnap.exists || vendorSnap.data()?.isActive !== true) return NextResponse.json({ error: "This food business is not currently accepting orders." }, { status: 400 });
    const itemRefs = requested.map(x => db.collection("menuItems").doc(x!.id));
    const itemSnaps = await db.getAll(...itemRefs);
    const lines = itemSnaps.map((snap, index) => {
      const inputLine = requested[index]!;
      const d = snap.data();
      if (!snap.exists || !d || d.isAvailable !== true || d.vendorId !== input.vendorId || typeof d.priceKes !== "number") return null;
      return { menuItemId: snap.id, itemName: String(d.name || "Food item"), item_name: String(d.name || "Food item"), quantity: inputLine.quantity, unitPriceKes: d.priceKes, unit_price_kes: d.priceKes, lineTotalKes: d.priceKes * inputLine.quantity, line_total_kes: d.priceKes * inputLine.quantity };
    });
    if (lines.some(x => x === null)) return NextResponse.json({ error: "A menu item is no longer available. Refresh the marketplace and try again." }, { status: 400 });
    const subtotal = lines.reduce((sum, line) => sum + line!.lineTotalKes, 0);
    const profileSnap = await db.collection("profiles").doc(user.uid).get();
    const profile = profileSnap.data();
    const orderRef = db.collection("orders").doc();
    const orderNumber = Date.now();
    const order = {
      orderNumber, customerId: user.uid, customerName: String(profile?.fullName || user.name || ""),
      vendorId: input.vendorId, vendorOwnerId: String(vendorSnap.data()?.ownerId || ""),
      vendorName: String(vendorSnap.data()?.businessName || "FoodLink partner"),
      status: "pending", subtotalKes: subtotal, deliveryFeeKes: 0, serviceFeeKes: 0, totalKes: subtotal,
      deliveryAddress: input.deliveryAddress.trim(), customerNote: typeof input.customerNote === "string" ? input.customerNote.slice(0, 1000) : "",
      paymentStatus: "unpaid", paymentProvider: null, paymentReference: null, items: lines, order_items: lines,
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp()
    };
    await orderRef.set(order);
    return NextResponse.json({ orderId: orderRef.id, message: "Order saved. It is awaiting vendor confirmation; M-Pesa checkout is not enabled yet." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Order service is not configured. Check Firebase Admin credentials and try again." }, { status: 503 });
  }
}
