import Link from "next/link";
import { collection, getDocs, limit, query, where } from "firebase-admin/firestore";
import MarketplaceClient, { type MarketplaceItem } from "./MarketplaceClient";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

const sampleItems: MarketplaceItem[] = [
  { id: "demo-1", name: "Kenyan Beef Pilau", description: "Fragrant spiced rice with tender beef, kachumbari and lemon.", category: "Kenyan favourites", price_kes: 450, image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85", preparation_minutes: 35, vendors: { id: "foodlink-demo", business_name: "FoodLink Kitchen Preview", description: "Sample menu while partners join", cuisine_types: ["Kenyan"] } },
  { id: "demo-2", name: "Grilled Chicken & Chips", description: "Char-grilled chicken, crisp chips and fresh salad.", category: "Grills", price_kes: 650, image_url: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85", preparation_minutes: 30, vendors: { id: "foodlink-demo", business_name: "FoodLink Kitchen Preview", description: "Sample menu while partners join", cuisine_types: ["Grill"] } },
  { id: "demo-3", name: "Creamy Chicken Alfredo", description: "Pasta tossed in a creamy parmesan-style sauce with chicken.", category: "International", price_kes: 700, image_url: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=900&q=85", preparation_minutes: 25, vendors: { id: "foodlink-demo", business_name: "FoodLink Kitchen Preview", description: "Sample menu while partners join", cuisine_types: ["Italian"] } },
  { id: "demo-4", name: "Beef Burger & Fries", description: "Juicy beef burger with lettuce, tomato and golden fries.", category: "Fast favourites", price_kes: 550, image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85", preparation_minutes: 20, vendors: { id: "foodlink-demo", business_name: "FoodLink Kitchen Preview", description: "Sample menu while partners join", cuisine_types: ["Burgers"] } },
  { id: "demo-5", name: "Fresh Garden Salad", description: "Crisp greens, cucumber, tomato, avocado and house dressing.", category: "Fresh & light", price_kes: 350, image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85", preparation_minutes: 15, vendors: { id: "foodlink-demo", business_name: "FoodLink Kitchen Preview", description: "Sample menu while partners join", cuisine_types: ["Salads"] } },
  { id: "demo-6", name: "Margherita Pizza", description: "Tomato, mozzarella and basil on a golden baked crust.", category: "International", price_kes: 800, image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85", preparation_minutes: 25, vendors: { id: "foodlink-demo", business_name: "FoodLink Kitchen Preview", description: "Sample menu while partners join", cuisine_types: ["Pizza"] } },
  { id: "demo-7", name: "Coconut Bean Stew & Rice", description: "Slow-cooked beans in coconut sauce with steamed rice.", category: "Plant based", price_kes: 380, image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85", preparation_minutes: 30, vendors: { id: "foodlink-demo", business_name: "FoodLink Kitchen Preview", description: "Sample menu while partners join", cuisine_types: ["Vegetarian"] } },
  { id: "demo-8", name: "Chocolate Brownie", description: "Rich chocolate brownie for a sweet finish.", category: "Dessert", price_kes: 220, image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85", preparation_minutes: 5, vendors: { id: "foodlink-demo", business_name: "FoodLink Kitchen Preview", description: "Sample menu while partners join", cuisine_types: ["Dessert"] } },
];

export default async function MarketplacePage() {
  let items: MarketplaceItem[] = [];
  let databaseMessage = "These sample dishes and prices are for preview only. Ask FoodLink to confirm availability, price and delivery.";
  try {
    const db = getAdminDb();
    const snap = await getDocs(query(collection(db, "menuItems"), where("isAvailable", "==", true), limit(60)));
    for (const itemDoc of snap.docs) {
      const d = itemDoc.data();
      if (!d.vendorId || typeof d.priceKes !== "number") continue;
      const vendorSnap = await db.collection("vendors").doc(String(d.vendorId)).get();
      const vendor = vendorSnap.exists ? vendorSnap.data() : undefined;
      if (!vendor || vendor.isActive !== true) continue;
      items.push({
        id: itemDoc.id, name: String(d.name || "Food item"), description: String(d.description || ""),
        category: String(d.category || "Menu"), price_kes: d.priceKes, image_url: typeof d.imageUrl === "string" ? d.imageUrl : null,
        preparation_minutes: Number(d.preparationMinutes || 30),
        vendors: { id: String(d.vendorId), business_name: String(vendor.businessName || "FoodLink partner"), description: String(vendor.description || ""), cuisine_types: Array.isArray(vendor.cuisineTypes) ? vendor.cuisineTypes : [] }
      });
    }
    databaseMessage = items.length ? "Browse available items from FoodLink food businesses. Prices and availability are subject to vendor confirmation." : "No approved live menus have been published yet. The sample catalogue is shown below.";
  } catch {
    databaseMessage = "Firebase is not configured or no live menu is published yet. The sample catalogue is shown below.";
  }
  if (!items.length) {
    items = sampleItems;
    databaseMessage = "[DEMO_CATALOG] Sample dishes and indicative prices only. Confirm availability and final price by WhatsApp.";
  }

  return <main style={{ minHeight: "100vh", background: "#f8f6ef", color: "#1c241d" }}>
    <header style={{ maxWidth: 1160, margin: "0 auto", padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e6e2d7", gap: 16 }}><Link href="/" style={{ fontSize: 23, fontWeight: 700 }}>food<span style={{ color: "#a97b2c" }}>link</span></Link><nav style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 13, fontWeight: 600 }}><Link href="/">Home</Link><Link href="/login" style={{ padding: "11px 15px", background: "#344b38", color: "white", borderRadius: 6 }}>Sign in / Join</Link></nav></header>
    <section style={{ maxWidth: 1160, margin: "0 auto", padding: "58px 24px 34px" }}><p style={{ color: "#a97b2c", letterSpacing: 2, fontSize: 10, fontWeight: 700 }}>THE FOODLINK MARKETPLACE</p><h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(40px, 5vw, 62px)", fontWeight: 500, lineHeight: 1.08, margin: "16px 0" }}>Discover your next <em style={{ color: "#a97b2c" }}>favourite.</em></h1><p style={{ maxWidth: 620, color: "#667067", lineHeight: 1.8 }}>Explore food from chefs and local food businesses. We are starting in Nairobi and Kiambu, connecting good food with the people who make it.</p></section>
    <MarketplaceClient items={items} databaseMessage={databaseMessage} />
    <footer style={{ background: "#344b38", color: "#fffdf8", padding: 24, textAlign: "center", fontSize: 12 }}>FOODLINK · ONE NETWORK. EVERY PLATE.</footer>
  </main>;
}
