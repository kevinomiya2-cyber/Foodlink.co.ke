"use client";

import { useState } from "react";

type OrderItem = { item_name: string; quantity: number; line_total_kes: number };
export type VendorOrder = {
  id: string;
  order_number: number;
  status: string;
  subtotal_kes: number;
  total_kes: number;
  created_at: string;
  delivery_address: string;
  customer_note: string;
  order_items: OrderItem[];
};

function kes(value: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);
}

const nextActions: Record<string, { label: string; status: string }[]> = {
  pending: [{ label: "Accept order", status: "accepted" }, { label: "Decline", status: "cancelled" }],
  accepted: [{ label: "Start preparing", status: "preparing" }, { label: "Cancel order", status: "cancelled" }],
  preparing: [{ label: "Mark ready for pickup", status: "ready" }],
  ready: [],
  picked_up: [],
  delivered: [],
  cancelled: [],
};

export default function VendorOrders({ initialOrders }: { initialOrders: VendorOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function updateStatus(orderId: string, status: string) {
    setBusyId(orderId);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/vendor/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update order.");
      setOrders(current => current.map(order => order.id === orderId ? { ...order, status } : order));
      setMessage(`Order #${orders.find(order => order.id === orderId)?.order_number ?? ""} updated.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update order.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section style={{ marginTop: 42 }}>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 500 }}>Incoming orders</h2>
      <p style={{ color: "#667067", lineHeight: 1.7, fontSize: 13 }}>Accept orders, update preparation status, and mark food ready for collection. Payments and rider dispatch are not enabled yet.</p>
      {error && <p role="alert" style={{ background: "#f8e8df", padding: 12, borderRadius: 7, fontSize: 13 }}>{error}</p>}
      {message && <p role="status" style={{ background: "#e8f0e3", padding: 12, borderRadius: 7, fontSize: 13 }}>{message}</p>}
      {!orders.length ? <div style={{ padding: 22, border: "1px solid #e6e2d7", borderRadius: 10, background: "#fffdf8", color: "#667067", fontSize: 13 }}>No orders yet. New customer orders will appear here.</div> :
        <div style={{ display: "grid", gap: 14 }}>
          {orders.map(order => <article key={order.id} style={{ border: "1px solid #e6e2d7", borderRadius: 12, background: "#fffdf8", padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div><strong>Order #{order.order_number}</strong><p style={{ margin: "5px 0", color: "#667067", fontSize: 12 }}>{new Date(order.created_at).toLocaleString("en-KE")}</p></div>
              <span style={{ borderRadius: 20, background: "#eee8d9", padding: "7px 11px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{order.status.replace("_", " ")}</span>
            </div>
            <div style={{ marginTop: 12, borderTop: "1px solid #eee9dd", borderBottom: "1px solid #eee9dd" }}>
              {order.order_items?.map((item, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", fontSize: 13 }}><span>{item.quantity} × {item.item_name}</span><strong>{kes(item.line_total_kes)}</strong></div>)}
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}><strong>Delivery:</strong> {order.delivery_address}</p>
            {order.customer_note && <p style={{ fontSize: 13, lineHeight: 1.6 }}><strong>Customer note:</strong> {order.customer_note}</p>}
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 16 }}>
              <div><span style={{ color: "#667067", fontSize: 12 }}>Order total</span><p style={{ margin: "4px 0 0", fontSize: 19, fontWeight: 700 }}>{kes(order.total_kes)} <span style={{ fontSize: 10, color: "#856a3a" }}>UNPAID</span></p></div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(nextActions[order.status] || []).map(action => <button key={action.status} type="button" disabled={busyId === order.id} onClick={() => updateStatus(order.id, action.status)} style={{ border: action.status === "cancelled" ? "1px solid #d8b9ad" : 0, borderRadius: 6, padding: "10px 12px", background: action.status === "cancelled" ? "#fff8f4" : "#344b38", color: action.status === "cancelled" ? "#8b3b28" : "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{busyId === order.id ? "Saving…" : action.label}</button>)}
              </div>
            </div>
          </article>)}
        </div>}
    </section>
  );
}
