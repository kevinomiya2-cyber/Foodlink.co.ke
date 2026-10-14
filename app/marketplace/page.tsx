import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type MenuItem = {
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

function formatKes(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function MarketplacePage() {
  let items: MenuItem[] = [];
  let databaseReady = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  let databaseMessage = "";

  if (databaseReady) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("menu_items")
        .select("id, name, description, category, price_kes, image_url, preparation_minutes, vendors!inner(id, business_name, description, cuisine_types)")
        .eq("is_available", true)
        .eq("vendors.is_active", true)
        .order("created_at", { ascending: false })
        .limit(60);

      if (error) {
        databaseMessage = "The marketplace database is not ready yet. Complete the Supabase setup to publish real menus.";
      } else {
        items = (data ?? []) as unknown as MenuItem[];
      }
    } catch {
      databaseMessage = "Food listings will appear here once the FoodLink database is connected.";
    }
  } else {
    databaseMessage = "Food listings will appear here once the FoodLink database is connected.";
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f8f6ef", color: "#1c241d" }}>
      <header style={{ maxWidth: 1160, margin: "0 auto", padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e6e2d7", gap: 16 }}>
        <Link href="/" style={{ fontSize: 23, fontWeight: 700 }}>food<span style={{ color: "#a97b2c" }}>link</span></Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 13, fontWeight: 600 }}>
          <Link href="/">Home</Link><Link href="/login" style={{ padding: "11px 15px", background: "#344b38", color: "white", borderRadius: 6 }}>Sign in / Join</Link>
        </nav>
      </header>
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "58px 24px 34px" }}>
        <p style={{ color: "#a97b2c", letterSpacing: 2, fontSize: 10, fontWeight: 700 }}>THE FOODLINK MARKETPLACE</p>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(40px, 5vw, 62px)", fontWeight: 500, lineHeight: 1.08, margin: "16px 0" }}>Discover your next <em style={{ color: "#a97b2c" }}>favourite.</em></h1>
        <p style={{ maxWidth: 620, color: "#667067", lineHeight: 1.8 }}>Explore food from chefs and local food businesses. We are starting in Nairobi and Kiambu, connecting good food with the people who make it.</p>
      </section>

      {items.length > 0 ? (
        <section style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(245px, 1fr))", gap: 20 }}>
          {items.map((item) => (
            <article key={item.id} style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, overflow: "hidden" }}>
              {item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: "100%", height: 190, objectFit: "cover", display: "block" }} /> : <div style={{ height: 190, display: "grid", placeItems: "center", background: "#eee8d9", fontSize: 48 }}>🍲</div>}
              <div style={{ padding: 18 }}>
                <p style={{ color: "#a97b2c", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>{item.category}</p>
                <h2 style={{ fontSize: 20, margin: "8px 0" }}>{item.name}</h2>
                <p style={{ color: "#667067", fontSize: 13, lineHeight: 1.6, minHeight: 42 }}>{item.description || "Freshly prepared by a local food professional."}</p>
                <p style={{ fontSize: 12, color: "#667067" }}>{item.vendors?.business_name || "FoodLink partner"} · {item.preparation_minutes} min</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 16 }}>
                  <strong style={{ fontSize: 19 }}>{formatKes(item.price_kes)}</strong>
                  <Link href="/login" style={{ padding: "10px 13px", borderRadius: 6, background: "#344b38", color: "white", fontSize: 12, fontWeight: 700 }}>Sign in to order</Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 90px" }}>
          <div style={{ border: "1px solid #e6e2d7", borderRadius: 14, padding: "clamp(24px, 5vw, 48px)", background: "#fffdf8" }}>
            <div style={{ fontSize: 34 }}>🥬</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 500, margin: "12px 0" }}>The table is being set.</h2>
            <p style={{ color: "#667067", lineHeight: 1.8, maxWidth: 640 }}>{databaseMessage || "No menus have been published yet. FoodLink partner menus will appear here once approved and made available."}</p>
            <Link href="/login" style={{ display: "inline-block", marginTop: 10, padding: "13px 17px", borderRadius: 6, background: "#344b38", color: "white", fontWeight: 700, fontSize: 13 }}>Join FoodLink ↗</Link>
          </div>
        </section>
      )}
      <footer style={{ background: "#344b38", color: "#fffdf8", padding: "24px", textAlign: "center", fontSize: 12 }}>FOODLINK · ONE NETWORK. EVERY PLATE.</footer>
    </main>
  );
}
