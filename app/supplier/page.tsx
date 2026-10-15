"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Product = { id: string; name: string; description: string; category: string; unit: string; price_kes: number; stock_quantity: number; is_available: boolean };

export default function SupplierWorkspace() {
  const [userId, setUserId] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Ingredients");
  const [unit, setUnit] = useState("kg");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sign in to access the supplier workspace."); return; }
    setUserId(user.id);
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role !== "supplier") { setError("This workspace is for approved suppliers. Apply through the partner page first."); return; }
    setAuthorized(true);
    const { data, error: listError } = await supabase.from("supplier_products").select("id,name,description,category,unit,price_kes,stock_quantity,is_available").eq("supplier_id", user.id).order("created_at", { ascending: false });
    if (listError) setError("Could not load your products. Check the database migration and try again.");
    else setProducts((data ?? []) as Product[]);
  }

  useEffect(() => { load().catch(() => setError("Could not connect to FoodLink. Check your database configuration.")); }, []);

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      const priceValue = Number(price);
      const stockValue = Number(stock);
      if (!Number.isInteger(priceValue) || priceValue < 0 || !Number.isFinite(stockValue) || stockValue < 0) throw new Error("Enter a valid whole-number KES price and non-negative stock quantity.");
      const { error: insertError } = await supabase.from("supplier_products").insert({ supplier_id: userId, name: name.trim(), description: description.trim(), category, unit, price_kes: priceValue, stock_quantity: stockValue, is_available: true });
      if (insertError) throw new Error("Product could not be saved. Confirm your supplier account is approved and the latest database migrations are applied.");
      setName(""); setDescription(""); setPrice(""); setStock("0");
      setMessage("Product added to your catalogue.");
      await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not add product."); }
    finally { setBusy(false); }
  }

  async function toggleProduct(product: Product) {
    const supabase = createClient();
    const { error: updateError } = await supabase.from("supplier_products").update({ is_available: !product.is_available }).eq("id", product.id).eq("supplier_id", userId);
    if (updateError) setError("Could not update product availability.");
    else setProducts(current => current.map(item => item.id === product.id ? { ...item, is_available: !item.is_available } : item));
  }

  const field = { width: "100%", boxSizing: "border-box" as const, padding: 12, marginTop: 6, border: "1px solid #dedacd", borderRadius: 6, background: "#fffdf8", font: "inherit" };

  return <main style={{ minHeight: "100vh", background: "#f8f6ef", color: "#1c241d" }}>
    <header style={{ maxWidth: 1120, margin: "0 auto", padding: "22px 24px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e6e2d7" }}><Link href="/" style={{ fontSize: 24, fontWeight: 800 }}>food<span style={{ color: "#a97b2c" }}>link</span></Link><Link href="/dashboard" style={{ fontWeight: 700 }}>My account ↗</Link></header>
    <section style={{ maxWidth: 1120, margin: "0 auto", padding: "38px 24px 70px" }}>
      <p style={{ color: "#a97b2c", letterSpacing: 2, fontSize: 10, fontWeight: 800 }}>SUPPLIER WORKSPACE</p><h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(36px,6vw,54px)", fontWeight: 500, margin: "12px 0" }}>Your products, <em>your catalogue.</em></h1><p style={{ color: "#667067", lineHeight: 1.8 }}>List ingredients and food products for approved FoodLink business partners to discover. Keep stock and prices current.</p>
      {error && <p role="alert" style={{ background: "#f8e8df", padding: 12, borderRadius: 7, lineHeight: 1.6 }}>{error}</p>}
      {message && <p role="status" style={{ background: "#e8f0e3", padding: 12, borderRadius: 7 }}>{message}</p>}
      {authorized && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 22, alignItems: "start", marginTop: 28 }}>
        <form onSubmit={addProduct} style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, padding: 22, display: "grid", gap: 14 }}>
          <h2 style={{ fontFamily: "Georgia,serif", fontWeight: 500, fontSize: 25, margin: 0 }}>Add a product</h2>
          <label style={{ fontSize: 12, fontWeight: 700 }}>Product name<input required minLength={2} value={name} onChange={e=>setName(e.target.value)} style={field} placeholder="e.g. Fresh tomatoes" /></label>
          <label style={{ fontSize: 12, fontWeight: 700 }}>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} style={field} rows={3} placeholder="Quality, origin, packaging..." /></label>
          <label style={{ fontSize: 12, fontWeight: 700 }}>Category<select value={category} onChange={e=>setCategory(e.target.value)} style={field}><option>Ingredients</option><option>Produce</option><option>Meat & poultry</option><option>Dairy & eggs</option><option>Dry goods</option><option>Packaging</option><option>Kitchen supplies</option><option>Other</option></select></label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700 }}>Unit<input required value={unit} onChange={e=>setUnit(e.target.value)} style={field} placeholder="kg, litre, crate" /></label>
            <label style={{ fontSize: 12, fontWeight: 700 }}>Price (KES)<input required type="number" min="0" step="1" value={price} onChange={e=>setPrice(e.target.value)} style={field} /></label>
          </div>
          <label style={{ fontSize: 12, fontWeight: 700 }}>Available stock<input required type="number" min="0" step="0.001" value={stock} onChange={e=>setStock(e.target.value)} style={field} /></label>
          <button disabled={busy} style={{ border: 0, borderRadius: 6, padding: 13, background: "#344b38", color: "white", fontWeight: 800 }}>{busy ? "Saving…" : "Add product"}</button>
        </form>
        <div style={{ display: "grid", gap: 12 }}><h2 style={{ fontFamily: "Georgia,serif", fontWeight: 500, fontSize: 25, margin: "0 0 4px" }}>Your catalogue ({products.length})</h2>
          {products.length === 0 && <div style={{ background: "#fffdf8", padding: 22, border: "1px solid #e6e2d7", borderRadius: 10, color: "#667067" }}>No products yet. Add your first listing to get started.</div>}
          {products.map(product=><article key={product.id} style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 10, padding: 18 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "start" }}><div><h3 style={{ margin: "0 0 6px", fontSize: 17 }}>{product.name}</h3><p style={{ color: "#667067", fontSize: 12, lineHeight: 1.6, margin: "0 0 8px" }}>{product.description || product.category}</p><strong>KES {product.price_kes.toLocaleString("en-KE")} / {product.unit}</strong><p style={{ fontSize: 11, color: "#667067" }}>Stock: {product.stock_quantity} · {product.is_available ? "Listed" : "Hidden"}</p></div><button onClick={()=>toggleProduct(product)} style={{ border: "1px solid #dedacd", borderRadius: 6, padding: "9px 10px", background: "white", fontSize: 11, fontWeight: 700 }}>{product.is_available ? "Hide" : "List"}</button></div></article>)}
        </div>
      </div>}
    </section>
  </main>;
}
