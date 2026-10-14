import Link from "next/link";
import MarketplaceClient, { type MarketplaceItem } from "./MarketplaceClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  let items: MarketplaceItem[] = [];
  let databaseMessage = "Food listings will appear here once the FoodLink database is connected.";

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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
        databaseMessage = "The database is connected, but its FoodLink schema is not ready yet. Apply the SQL migration and try again.";
      } else {
        items = (data ?? []) as unknown as MarketplaceItem[];
        databaseMessage = "No approved menus have been published yet. FoodLink partner listings will appear here when available.";
      }
    } catch {
      databaseMessage = "Food listings are temporarily unavailable. Check the database connection and try again.";
    }
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
      <MarketplaceClient items={items} databaseMessage={databaseMessage} />
      <footer style={{ background: "#344b38", color: "#fffdf8", padding: "24px", textAlign: "center", fontSize: 12 }}>FOODLINK · ONE NETWORK. EVERY PLATE.</footer>
    </main>
  );
}
