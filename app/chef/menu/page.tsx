"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MenuItem = { id: string; name: string; description: string; category: string; price_kes: number; image_url: string | null; preparation_minutes: number; is_available: boolean };

export default function ChefMenuPage() {
  const [vendorId, setVendorId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Main");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [minutes, setMinutes] = useState("30");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sign in to manage a menu."); return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role !== "chef") { setError("Only approved chef accounts can manage food menus. Apply through the partner page first."); return; }
    const { data: vendor, error: vendorError } = await supabase.from("vendors").select("id,business_name").eq("owner_id", user.id).maybeSingle();
    if (vendorError || !vendor) { setError("Your food business profile is not set up yet. Submit a partner application and wait for approval."); return; }
    setVendorId(vendor.id); setVendorName(vendor.business_name); setAuthorized(true);
    const { data, error: itemError } = await supabase.from("menu_items").select("id,name,description,category,price_kes,image_url,preparation_minutes,is_available").eq("vendor_id", vendor.id).order("created_at", { ascending: false });
    if (itemError) setError("Could not load menu items. Check the database migration.");
    else setItems((data ?? []) as MenuItem[]);
  }

  useEffect(() => { load().catch(() => setError("Could not connect to FoodLink. Check the database configuration.")); }, []);

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const priceValue = Number(price), prepValue = Number(minutes);
      if (!Number.isInteger(priceValue) || priceValue < 0 || !Number.isInteger(prepValue) || prepValue < 1 || prepValue > 1440) throw new Error("Enter a whole-number price and preparation time between 1 and 1440 minutes.");
      const supabase = createClient();
      const { error: insertError } = await supabase.from("menu_items").insert({ vendor_id: vendorId, name: name.trim(), description: description.trim(), category, price_kes: priceValue, image_url: imageUrl.trim() || null, preparation_minutes: prepValue, is_available: true });
      if (insertError) throw new Error("Menu item could not be saved. Confirm your chef account is approved and the database migrations are applied.");
      setName(""); setDescription(""); setPrice(""); setImageUrl(""); setMinutes("30"); setMessage("Menu item saved.");
      await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save menu item."); }
    finally { setBusy(false); }
  }

  async function toggle(item: MenuItem) {
    const supabase = createClient();
    const { error: updateError } = await supabase.from("menu_items").update({ is_available: !item.is_available }).eq("id", item.id).eq("vendor_id", vendorId);
    if (updateError) setError("Could not update availability.");
    else setItems(current => current.map(row => row.id === item.id ? { ...row, is_available: !item.is_available } : row));
  }

  const field = { width: "100%", boxSizing: "border-box" as const, padding: 12, marginTop: 6, border: "1px solid #dedacd", borderRadius: 6, background: "#fffdf8", font: "inherit" };

  return <main style={{ minHeight: "100vh", background: "#f8f6ef", color: "#1c241d" }}>
    <header style={{ maxWidth: 1120, margin: "0 auto", padding: "22px 24px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e6e2d7" }}><Link href="/" style={{ fontSize: 24, fontWeight: 800 }}>food<span style={{ color: "#a97b2c" }}>link</span></Link><Link href="/workspace" style={{ fontWeight: 700 }}>Workspace ↗</Link></header>
    <section style={{ maxWidth: 1120, margin: "0 auto", padding: "38px 24px 70px" }}>
      <p style={{ color: "#a97b2c", letterSpacing: 2, fontSize: 10, fontWeight: 800 }}>CHEF & FOOD BUSINESS WORKSPACE</p><h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(36px,6vw,54px)", fontWeight: 500, margin: "12px 0" }}>Manage your <em>menu.</em></h1><p style={{ color: "#667067", lineHeight: 1.8 }}>{vendorName || "Your food business"} · Add dishes, prices and photos, then control whether each item is available.</p>
      {error && <p role="alert" style={{ background: "#f8e8df", padding: 12, borderRadius: 7, lineHeight: 1.6 }}>{error}</p>}{message && <p role="status" style={{ background: "#e8f0e3", padding: 12, borderRadius: 7 }}>{message}</p>}
      {authorized && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 22, alignItems: "start", marginTop: 28 }}>
        <form onSubmit={addItem} style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, padding: 22, display: "grid", gap: 14 }}>
          <h2 style={{ fontFamily: "Georgia,serif", fontWeight: 500, fontSize: 25, margin: 0 }}>Add a dish</h2>
          <label style={{ fontSize: 12, fontWeight: 700 }}>Dish name<input required minLength={2} value={name} onChange={e=>setName(e.target.value)} style={field} placeholder="e.g. Beef pilau" /></label>
          <label style={{ fontSize: 12, fontWeight: 700 }}>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} style={field} rows={3} placeholder="Ingredients, sides, dietary notes..." /></label>
          <label style={{ fontSize: 12, fontWeight: 700 }}>Category<select value={category} onChange={e=>setCategory(e.target.value)} style={field}><option>Main</option><option>Kenyan favourites</option><option>Breakfast</option><option>Snacks & sides</option><option>Salads</option><option>Dessert</option><option>Drinks</option><option>Other</option></select></label>
          <label style={{ fontSize: 12, fontWeight: 700 }}>Price (KES)<input required type="number" min="0" step="1" value={price} onChange={e=>setPrice(e.target.value)} style={field} /></label>
          <label style={{ fontSize: 12, fontWeight: 700 }}>Food photo URL (optional)<input type="url" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} style={field} placeholder="https://..." /></label>
          <label style={{ fontSize: 12, fontWeight: 700 }}>Preparation time (minutes)<input required type="number" min="1" max="1440" step="1" value={minutes} onChange={e=>setMinutes(e.target.value)} style={field} /></label>
          <button disabled={busy} style={{ border: 0, borderRadius: 6, padding: 13, background: "#344b38", color: "white", fontWeight: 800 }}>{busy ? "Saving…" : "Save dish"}</button>
        </form>
        <div style={{ display: "grid", gap: 12 }}><h2 style={{ fontFamily: "Georgia,serif", fontWeight: 500, fontSize: 25, margin: "0 0 4px" }}>Your menu ({items.length})</h2>{items.length === 0 && <div style={{ background: "#fffdf8", padding: 22, border: "1px solid #e6e2d7", borderRadius: 10, color: "#667067" }}>No dishes yet. Add your first menu item.</div>}{items.map(item=><article key={item.id} style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 10, padding: 18, display: "flex", gap: 14 }}><div style={{ flex: 1 }}><h3 style={{ margin: "0 0 6px", fontSize: 17 }}>{item.name}</h3><p style={{ color: "#667067", fontSize: 12, lineHeight: 1.6 }}>{item.description}</p><strong>KES {item.price_kes.toLocaleString("en-KE")}</strong><p style={{ fontSize: 11, color: "#667067" }}>{item.preparation_minutes} min · {item.is_available ? "Available" : "Hidden"}</p></div><button onClick={()=>toggle(item)} style={{ height: "fit-content", border: "1px solid #dedacd", borderRadius: 6, padding: "9px 10px", background: "white", fontSize: 11, fontWeight: 700 }}>{item.is_available ? "Hide" : "Show"}</button></article>)}</div>
      </div>}
    </section>
  </main>;
}
