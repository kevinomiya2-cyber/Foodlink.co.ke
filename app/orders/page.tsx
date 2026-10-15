"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";

type OrderLine = { itemName?: string; item_name?: string; quantity: number; lineTotalKes?: number; line_total_kes?: number };
type Order = { id: string; orderNumber?: number; status?: string; subtotalKes?: number; deliveryFeeKes?: number; serviceFeeKes?: number; totalKes?: number; deliveryAddress?: string; paymentStatus?: string; createdAt?: { toDate?: () => Date }; vendorName?: string; items?: OrderLine[]; order_items?: OrderLine[] };

function kes(value: number | undefined) { return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value || 0); }

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let stopOrders: (() => void) | undefined;
    const stopAuth = onAuthStateChanged(getFirebaseAuth(), user => {
      if (!user) { window.location.href = "/login?next=%2Forders"; return; }
      const q = query(collection(getFirebaseDb(), "orders"), where("customerId", "==", user.uid), orderBy("createdAt", "desc"), limit(50));
      stopOrders = onSnapshot(q, snapshot => {
        setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
        setLoading(false); setError("");
      }, () => { setError("Could not load order history. Confirm Firestore rules are deployed."); setLoading(false); });
    });
    return () => { stopAuth(); stopOrders?.(); };
  }, []);

  return <main style={{ minHeight: "100vh", background: "#f8f6ef", color: "#1c241d" }}>
    <header style={{ maxWidth: 1120, margin: "0 auto", padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e6e2d7" }}><Link href="/" style={{ fontSize: 24, fontWeight: 800 }}>food<span style={{ color: "#a97b2c" }}>link</span></Link><Link href="/dashboard" style={{ fontWeight: 700 }}>My account ↗</Link></header>
    <section style={{ maxWidth: 980, margin: "0 auto", padding: "38px 24px 70px" }}>
      <p style={{ color: "#a97b2c", letterSpacing: 2, fontSize: 10, fontWeight: 800 }}>CUSTOMER ACCOUNT</p><h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(36px,6vw,54px)", fontWeight: 500, margin: "12px 0" }}>Your <em>orders.</em></h1><p style={{ color: "#667067", lineHeight: 1.8 }}>Review order history and current status. M-Pesa checkout is not enabled yet, so all orders remain unpaid.</p>
      {loading && <p>Loading your orders…</p>}{error && <p role="alert" style={{ background: "#f8e8df", padding: 12, borderRadius: 7 }}>{error}</p>}
      {!loading && !error && orders.length === 0 && <div style={{ marginTop: 24, background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 10, padding: 24 }}><h2 style={{ fontFamily: "Georgia,serif", fontWeight: 500 }}>No orders yet</h2><p style={{ color: "#667067", lineHeight: 1.7 }}>Your checkouts will appear here.</p><Link href="/marketplace" style={{ display: "inline-block", background: "#344b38", color: "white", padding: "12px 15px", borderRadius: 6, fontSize: 12, fontWeight: 800 }}>Browse marketplace ↗</Link></div>}
      <div style={{ display: "grid", gap: 14, marginTop: 24 }}>{orders.map(order => {
        const lines = order.items || order.order_items || [];
        const created = order.createdAt?.toDate?.();
        return <article key={order.id} style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div><p style={{ color: "#a97b2c", letterSpacing: 1.2, fontSize: 10, fontWeight: 800, margin: "0 0 8px" }}>ORDER #{order.orderNumber || order.id.slice(0,8)}</p><h2 style={{ fontFamily: "Georgia,serif", fontWeight: 500, fontSize: 24, margin: "0 0 6px" }}>{order.vendorName || "FoodLink partner"}</h2>{created && <p style={{ color: "#667067", fontSize: 12, margin: 0 }}>{created.toLocaleString("en-KE")}</p>}</div><div style={{ display: "grid", gap: 6, alignContent: "start" }}><span style={{ padding: "7px 10px", borderRadius: 20, background: "#efe9d9", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>{(order.status || "pending").replaceAll("_"," ")}</span><span style={{ padding: "7px 10px", borderRadius: 20, background: order.paymentStatus === "paid" ? "#e8f0e3" : "#f8e8df", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>Payment: {order.paymentStatus || "unpaid"}</span></div></div>
          <div style={{ borderTop: "1px solid #e6e2d7", borderBottom: "1px solid #e6e2d7", margin: "16px 0", padding: "12px 0" }}>{lines.map((line,index)=><div key={(line.itemName || line.item_name || "item")+index} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", fontSize: 13 }}><span>{line.quantity} × {line.itemName || line.item_name || "Food item"}</span><strong>{kes(line.lineTotalKes ?? line.line_total_kes ?? 0)}</strong></div>)}</div>
          <p style={{ color: "#667067", fontSize: 12, lineHeight: 1.7 }}>Delivery to: {order.deliveryAddress || "Address not provided"}</p><div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><span style={{ color: "#667067", fontSize: 13 }}>Food {kes(order.subtotalKes)} · Delivery {kes(order.deliveryFeeKes || 0)} · Service {kes(order.serviceFeeKes || 0)}</span><strong style={{ fontSize: 18 }}>Total {kes(order.totalKes || 0)}</strong></div>
        </article>;
      })}</div>
    </section>
  </main>;
}
