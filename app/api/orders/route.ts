import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Sign in before placing an order." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid order details." }, { status: 400 });
  }

  const input = body as {
    vendorId?: unknown;
    deliveryAddress?: unknown;
    customerNote?: unknown;
    items?: unknown;
  };

  if (typeof input.vendorId !== "string" ||
      typeof input.deliveryAddress !== "string" ||
      !Array.isArray(input.items) ||
      input.items.length < 1 ||
      input.items.length > 50) {
    return NextResponse.json({ error: "Add food to your cart and enter a delivery address." }, { status: 400 });
  }

  const items = input.items.map((entry) => {
    if (!entry || typeof entry !== "object") return null;
    const value = entry as { menuItemId?: unknown; quantity?: unknown };
    if (typeof value.menuItemId !== "string" ||
        typeof value.quantity !== "number" ||
        !Number.isInteger(value.quantity) ||
        value.quantity < 1 ||
        value.quantity > 100) return null;
    return { menu_item_id: value.menuItemId, quantity: value.quantity };
  });

  if (items.some((item) => item === null)) {
    return NextResponse.json({ error: "One or more cart items are invalid." }, { status: 400 });
  }

  if (input.deliveryAddress.trim().length < 8) {
    return NextResponse.json({ error: "Enter a complete delivery address." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("place_food_order", {
    p_vendor_id: input.vendorId,
    p_delivery_address: input.deliveryAddress.trim(),
    p_customer_note: typeof input.customerNote === "string" ? input.customerNote.slice(0, 1000) : "",
    p_items: items,
  });

  if (error) {
    const clientMessage = error.message.includes("not currently accepting")
      ? "This food business is not currently accepting orders."
      : error.message.includes("no longer available")
      ? "A menu item is no longer available. Refresh the marketplace and try again."
      : error.message.includes("complete delivery address")
      ? "Enter a complete delivery address."
      : error.message.includes("sign in")
      ? "Your session has expired. Sign in again."
      : "We could not place your order. Please refresh and try again.";
    return NextResponse.json({ error: clientMessage }, { status: 400 });
  }

  return NextResponse.json({
    orderId: data,
    message: "Order created successfully. It is awaiting vendor confirmation and payment is not yet enabled.",
  }, { status: 201 });
}
