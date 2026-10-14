import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const { orderId } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const status = body && typeof body === "object" ? (body as { status?: unknown }).status : null;
  if (typeof status !== "string" || !["accepted", "preparing", "ready", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Unsupported order status." }, { status: 400 });
  }

  const { error } = await supabase.rpc("set_vendor_order_status", {
    p_order_id: orderId,
    p_status: status,
  });
  if (error) return NextResponse.json({ error: error.message.includes("Order not found") ? "You cannot update this order." : error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
