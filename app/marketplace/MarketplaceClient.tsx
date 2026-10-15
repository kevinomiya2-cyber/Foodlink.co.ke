"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";

export type MarketplaceItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price_kes: number;
  image_url: string | null;
  preparation_minutes: number;
  vendors: {
    id: string;
    business_name: string;
    description: string;
    cuisine_types: string[];
  } | null;
};

type CartLine = { item: MarketplaceItem; quantity: number };

function formatKes(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function MarketplaceClient({ items, databaseMessage }: { items: MarketplaceItem[]; databaseMessage: string }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orderId, setOrderId] = useState("");
  const demoMode = databaseMessage.includes("[DEMO_CATALOG]");

  const vendorIds = Array.from(new Set(cart.map(line => line.item.vendors?.id).filter(Boolean)));
  const subtotal = useMemo(() => cart.reduce((sum, line) => sum + line.item.price_kes * line.quantity, 0), [cart]);
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const canCheckout = cart.length > 0 && vendorIds.length === 1;

  function addItem(item: MarketplaceItem) {
    if (!item.vendors?.id) return;
    const currentVendors = Array.from(new Set(cart.map(line => line.item.vendors?.id).filter(Boolean)));
    if (currentVendors.length && !currentVendors.includes(item.vendors.id)) {
      setError("For now, one order can contain food from one business. Finish or clear this cart before choosing another vendor.");
      return;
    }
    setError("");
    setSuccess("");
    setOrderId("");
    const found = cart.find(line => line.item.id === item.id);
    if (found) {
      setCart(cart.map(line => line.item.id === item.id ? { ...line, quantity: Math.min(100, line.quantity + 1) } : line));
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
  }

  function changeQuantity(itemId: string, delta: number) {
    setCart(current => current
      .map(line => line.item.id === itemId ? { ...line, quantity: line.quantity + delta } : line)
      .filter(line => line.quantity > 0));
  }

  async function placeOrder() {
    setError("");
    setSuccess("");
    setOrderId("");
    if (!canCheckout) {
      setError("Choose food from one business before checking out.");
      return;
    }
    if (address.trim().length < 8) {
      setError("Enter a complete delivery address, including estate, road, or building.");
      return;
    }

    if (demoMode) {
      const lines = cart.map(line => `• ${line.quantity} × ${line.item.name} = ${formatKes(line.item.price_kes * line.quantity)}`);
      const message = [
        "Hello FoodLink, I would like to enquire about an order:",
        ...lines,
        `Food subtotal: ${formatKes(subtotal)}`,
        `Delivery address: ${address.trim()}`,
        note.trim() ? `Note: ${note.trim()}` : "",
        "Please confirm availability, final price, delivery fee and payment instructions."
      ].filter(Boolean).join("\n");
      window.location.href = `https://wa.me/254768395450?text=${encodeURIComponent(message)}`;
      return;
    }

    setBusy(true);
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken();
      if (!token) {
        window.location.href = "/login?next=%2Fmarketplace";
        return;
      }
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          vendorId: vendorIds[0],
          deliveryAddress: address.trim(),
          customerNote: note.trim(),
          items: cart.map(line => ({ menuItemId: line.item.id, quantity: line.quantity })),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?next=%2Fmarketplace";
          return;
        }
        throw new Error(result.error || "We could not place your order.");
      }
      setOrderId(String(result.orderId));
      setSuccess(result.message || "Your order has been placed.");
      setCart([]);
      setAddress("");
      setNote("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not place your order. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {items.length > 0 ? (
        <section style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 56px", display: "grid", gridTemplateColumns: cart.length ? "minmax(0, 1fr) minmax(280px, 340px)" : "1fr", gap: 22, alignItems: "start" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 18 }}>
            {items.map(item => (
              <article key={item.id} style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, overflow: "hidden" }}>
                {item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: "100%", height: 170, objectFit: "cover", display: "block" }} /> : <div style={{ height: 170, display: "grid", placeItems: "center", background: "#eee8d9", fontSize: 45 }}>🍲</div>}
                <div style={{ padding: 17 }}>
                  <p style={{ color: "#a97b2c", fontSize: 10, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase" }}>{item.category}</p>
                  <h2 style={{ fontSize: 19, margin: "8px 0" }}>{item.name}</h2>
                  <p style={{ color: "#667067", fontSize: 13, lineHeight: 1.6, minHeight: 42 }}>{item.description || "Freshly prepared by a local food professional."}</p>
                  <p style={{ fontSize: 12, color: "#667067" }}>{item.vendors?.business_name || "FoodLink partner"} · {item.preparation_minutes} min</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 14 }}>
                    <strong style={{ fontSize: 18 }}>{formatKes(item.price_kes)}</strong>
                    <button type="button" onClick={() => addItem(item)} style={{ padding: "10px 12px", borderRadius: 6, border: 0, background: "#344b38", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add to cart</button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {cart.length > 0 && <aside style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, padding: 20, position: "sticky", top: 18 }}>
            <p style={{ color: "#a97b2c", letterSpacing: 1.5, fontSize: 10, fontWeight: 700 }}>YOUR CART · {cartCount} ITEM{cartCount === 1 ? "" : "S"}</p>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 500, margin: "10px 0 16px" }}>Checkout</h2>
            <p style={{ color: "#667067", fontSize: 12, marginBottom: 12 }}>From {cart[0].item.vendors?.business_name}</p>
            {cart.map(line => <div key={line.item.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 0", borderBottom: "1px solid #eee9dd" }}>
              <div style={{ minWidth: 0 }}><strong style={{ fontSize: 13 }}>{line.item.name}</strong><p style={{ margin: "5px 0 0", fontSize: 12, color: "#667067" }}>{formatKes(line.item.price_kes * line.quantity)}</p></div>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}><button type="button" aria-label={"Remove one " + line.item.name} onClick={() => changeQuantity(line.item.id, -1)} style={{ width: 27, height: 27, border: "1px solid #dedacd", borderRadius: 5, background: "white" }}>−</button><span style={{ fontSize: 13 }}>{line.quantity}</span><button type="button" aria-label={"Add one " + line.item.name} onClick={() => changeQuantity(line.item.id, 1)} style={{ width: 27, height: 27, border: "1px solid #dedacd", borderRadius: 5, background: "white" }}>+</button></div>
            </div>)}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", fontSize: 16 }}><strong>Food subtotal</strong><strong>{formatKes(subtotal)}</strong></div>
            <p style={{ fontSize: 11, lineHeight: 1.6, color: "#856a3a" }}>{demoMode ? "Preview menu: send your enquiry on WhatsApp. We will confirm availability, delivery and payment before you pay." : "Online M-Pesa payment is not enabled yet. Orders are saved for vendor review."}</p>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginTop: 16 }}>Delivery address<textarea required minLength={8} value={address} onChange={e => setAddress(e.target.value)} placeholder="Estate, road, building, town…" rows={3} style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 7, padding: 11, border: "1px solid #dedacd", borderRadius: 6, font: "inherit", fontSize: 13, background: "#fffdf8" }} /></label>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginTop: 13 }}>Note to the chef (optional)<textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Allergies, directions, or other notes" rows={2} maxLength={1000} style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 7, padding: 11, border: "1px solid #dedacd", borderRadius: 6, font: "inherit", fontSize: 13, background: "#fffdf8" }} /></label>
            {error && <p role="alert" style={{ marginTop: 12, padding: 10, borderRadius: 6, background: "#f8e8df", fontSize: 12, lineHeight: 1.5 }}>{error}</p>}
            <button type="button" disabled={busy} onClick={placeOrder} style={{ width: "100%", marginTop: 15, padding: 13, border: 0, borderRadius: 6, background: "#344b38", color: "white", fontWeight: 700, opacity: busy ? 0.6 : 1, cursor: busy ? "wait" : "pointer" }}>{busy ? "Placing order…" : demoMode ? "Enquire via WhatsApp" : "Place order"}</button>
            <button type="button" onClick={() => { setCart([]); setError(""); setSuccess(""); }} style={{ width: "100%", marginTop: 8, padding: 10, border: 0, background: "transparent", color: "#667067", cursor: "pointer", fontSize: 12 }}>Clear cart</button>
          </aside>}
        </section>
      ) : (
        <section style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 80px" }}>
          {success ? <div role="status" style={{ border: "1px solid #d4e1ce", borderRadius: 14, padding: "clamp(24px, 5vw, 48px)", background: "#f0f5eb" }}>
            <div style={{ fontSize: 34 }}>✓</div><h2 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 500, margin: "12px 0" }}>Order received.</h2><p style={{ color: "#52624f", lineHeight: 1.8 }}>{success}</p>{orderId && <p style={{ fontSize: 12, overflowWrap: "anywhere" }}>Order reference: {orderId}</p>}<p style={{ color: "#856a3a", fontSize: 12, lineHeight: 1.7 }}>Payment is still disabled. Do not send money until FoodLink enables and verifies its official payment flow.</p><Link href="/dashboard" style={{ display: "inline-block", marginTop: 8, padding: "12px 16px", borderRadius: 6, background: "#344b38", color: "white", fontWeight: 700, fontSize: 13 }}>View account</Link>
          </div> : <div style={{ border: "1px solid #e6e2d7", borderRadius: 14, padding: "clamp(24px, 5vw, 48px)", background: "#fffdf8" }}>
            <div style={{ fontSize: 34 }}>🥬</div><h2 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 500, margin: "12px 0" }}>The table is being set.</h2><p style={{ color: "#667067", lineHeight: 1.8, maxWidth: 640 }}>{databaseMessage || "No menus have been published yet. Approved FoodLink partner menus will appear here."}</p><Link href="/login" style={{ display: "inline-block", marginTop: 10, padding: "13px 17px", borderRadius: 6, background: "#344b38", color: "white", fontWeight: 700, fontSize: 13 }}>Join FoodLink ↗</Link>
          </div>}
        </section>
      )}
      {error && !cart.length && !success && <p role="alert" style={{ maxWidth: 1160, margin: "-60px auto 60px", padding: "0 24px", color: "#a13d22" }}>{error}</p>}
    </>
  );
}
