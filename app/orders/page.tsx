import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type OrderRow = {
  id: string;
  order_number: number;
  status: string;
  subtotal_kes: number;
  delivery_fee_kes: number;
  service_fee_kes: number;
  total_kes: number;
  delivery_address: string;
  payment_status: string;
  created_at: string;
  vendors: { business_name: string } | null;
  order_items: { item_name: string; quantity: number; unit_price_kes: number; line_total_kes: number }[];
};

function kes(value: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);
}

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Forders");

  const { data, error } = await supabase
    .from("orders")
    .select("id,order_number,status,subtotal_kes,delivery_fee_kes,service_fee_kes,total_kes,delivery_address,payment_status,created_at,vendors(business_name),order_items(item_name,quantity,unit_price_kes,line_total_kes)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const orders = (data ?? []) as unknown as OrderRow[];
  return <main style={{ minHeight: "100vh", background: "#f8f6ef", color: "#1c241d" }}>
    <header style={{ maxWidth: 1120, margin: "0 auto", padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e6e2d7" }}><Link href="/" style={{ fontSize: 24, fontWeight: 800 }}>food<span style={{ color: "#a97b2c" }}>link</span></Link><Link href="/workspace" style={{ fontWeight: 700 }}>Workspace ↗</Link></header>
    <section style={{ maxWidth: 980, margin: "0 auto", padding: "38px 24px 70px" }}>
      <p style={{ color: "#a97b2c", letterSpacing: 2, fontSize: 10, fontWeight: 800 }}>CUSTOMER ACCOUNT</p><h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(36px,6vw,54px)", fontWeight: 500, margin: "12px 0" }}>Your <em>orders.</em></h1><p style={{ color: "#667067", lineHeight: 1.8 }}>Review your order history, totals and current status. M-Pesa checkout is not enabled yet, so orders remain unpaid until the official payment flow is configured.</p>
      {error && <p role="alert" style={{ background: "#f8e8df", padding: 12, borderRadius: 7 }}>We could not load your orders. Refresh the page and try again.</p>}
      {!error && orders.length === 0 && <div style={{ marginTop: 24, background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 10, padding: 24 }}><h2 style={{ fontFamily: "Georgia,serif", fontWeight: 500 }}>No orders yet</h2><p style={{ color: "#667067", lineHeight: 1.7 }}>Your completed checkouts will appear here.</p><Link href="/marketplace" style={{ display: "inline-block", background: "#344b38", color: "white", padding: "12px 15px", borderRadius: 6, fontSize: 12, fontWeight: 800 }}>Browse marketplace ↗</Link></div>}
      <div style={{ display: "grid", gap: 14, marginTop: 24 }}>{orders.map(order=><article key={order.id} style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, padding: 22 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div><p style={{ color: "#a97b2c", letterSpacing: 1.2, fontSize: 10, fontWeight: 800, margin: "0 0 8px" }}>ORDER #{order.order_number}</p><h2 style={{ fontFamily: "Georgia,serif", fontWeight: 500, fontSize: 24, margin: "0 0 6px" }}>{order.vendors?.business_name ?? "FoodLink partner"}</h2><p style={{ color: "#667067", fontSize: 12, margin: 0 }}>{new Date(order.created_at).toLocaleString("en-KE")}</p></div><div style={{ display: "grid", gap: 6, alignContent: "start" }}><span style={{ padding: "7px 10px", borderRadius: 20, background: "#efe9d9", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>{order.status.replaceAll("_", " ")}</span><span style={{ padding: "7px 10px", borderRadius: 20, background: order.payment_status === "paid" ? "#e8f0e3" : "#f8e8df", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>Payment: {order.payment_status}</span></div></div><div style={{ borderTop: "1px solid #e6e2d7", borderBottom: "1px solid #e6e2d7", margin: "16px 0", padding: "12px 0" }}>{(order.order_items ?? []).map((item,index)=><div key={item.item_name + index} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", fontSize: 13 }}><span>{item.quantity} × {item.item_name}</span><strong>{kes(item.line_total_kes)}</strong></div>)}</div><p style={{ color: "#667067", fontSize: 12, lineHeight: 1.7 }}>Delivery to: {order.delivery_address}</p><div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: 13 }}><span style={{ color: "#667067" }}>Food {kes(order.subtotal_kes)} · Delivery {kes(order.delivery_fee_kes)} · Service {kes(order.service_fee_kes)}</span><strong style={{ fontSize: 18 }}>Total {kes(order.total_kes)}</strong></div></article>)}</div>
    </section>
  </main>;
}
