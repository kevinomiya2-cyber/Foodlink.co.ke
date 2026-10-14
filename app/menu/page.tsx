"use client";

import Link from "next/link";

const contactNumber = "254768395450";
const menu = [
  { name: "Kenyan Beef Stew & Rice", category: "Kenyan favourites", price: 650, description: "Slow-simmered beef stew, fragrant rice and seasonal vegetables.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85" },
  { name: "Chicken Alfredo Pasta", category: "Comfort classics", price: 750, description: "Creamy Alfredo-style sauce, chicken and pasta finished with herbs.", image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=900&q=85" },
  { name: "Jollof Rice & Chicken", category: "African plates", price: 700, description: "Tomato-spiced rice served with seasoned chicken and fresh sides.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85" },
  { name: "Chicken Fajita Salad", category: "Fresh & light", price: 600, description: "Grilled chicken, crisp lettuce, peppers, avocado and zesty dressing.", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85" },
  { name: "Greek Salad with Feta", category: "Fresh & light", price: 500, description: "Tomatoes, cucumber, olives, feta and a bright herb dressing.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85" },
  { name: "Lasagne al Forno", category: "Comfort classics", price: 800, description: "Layered pasta, rich meat sauce and a golden baked cheese topping.", image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=900&q=85" },
  { name: "Golden Samosas", category: "Snacks & sides", price: 100, description: "Crisp pastry parcels with a savoury filling. Price per piece.", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85" },
  { name: "Mandazi", category: "Snacks & sides", price: 60, description: "Soft, lightly sweet Kenyan-style mandazi. Price per piece.", image: "https://images.unsplash.com/photo-1608198093002-ad4e005484f2?auto=format&fit=crop&w=900&q=85" },
];

function kes(amount: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);
}

function orderLink(name: string) {
  const message = `Hello FoodLink, I'd like to ask about ordering: ${name}. Please confirm availability, final price and delivery cost.`;
  return `https://wa.me/${contactNumber}?text=${encodeURIComponent(message)}`;
}

export default function MenuPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8f6ef", color: "#1c241d" }}>
      <header style={{ maxWidth: 1160, margin: "0 auto", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, borderBottom: "1px solid #e6e2d7" }}>
        <Link href="/" style={{ fontSize: 24, fontWeight: 800, letterSpacing: -1 }}>food<span style={{ color: "#a97b2c" }}>link</span><small style={{ display: "block", fontSize: 8, letterSpacing: 1.8, marginTop: 5, color: "#667067" }}>ONE NETWORK. EVERY PLATE.</small></Link>
        <nav style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 13, fontWeight: 700 }}>
          <Link href="/marketplace">Marketplace</Link>
          <a href={`https://wa.me/${contactNumber}?text=Hello%20FoodLink%2C%20I%20have%20a%20question.`} target="_blank" rel="noreferrer" style={{ background: "#344b38", color: "white", padding: "12px 15px", borderRadius: 7 }}>Contact us</a>
        </nav>
      </header>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "56px 24px 34px" }}>
        <p style={{ color: "#a97b2c", letterSpacing: 2, fontSize: 10, fontWeight: 800 }}>FOODLINK SAMPLE MENU · KENYA</p>
        <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 500, fontSize: "clamp(42px, 6vw, 68px)", lineHeight: 1.05, margin: "16px 0" }}>Good food, <em style={{ color: "#a97b2c" }}>closer.</em></h1>
        <p style={{ maxWidth: 680, color: "#667067", fontSize: 16, lineHeight: 1.8 }}>Explore a starter selection of Kenyan favourites and global comfort food. Tap any dish to ask us about ordering on WhatsApp.</p>
        <div style={{ marginTop: 20, padding: "14px 16px", background: "#f1e8d4", borderRadius: 8, fontSize: 12, lineHeight: 1.7, color: "#594622" }}>
          <strong>Important:</strong> These are draft menu examples and indicative prices, not confirmed live stock. Ask us to confirm availability, final price and delivery charges before paying. M-Pesa checkout is not active yet because FoodLink has not registered/configured a business payment channel.
        </div>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 64px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 245px), 1fr))", gap: 20 }}>
        {menu.map((item) => (
          <article key={item.name} style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 13, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <img src={item.image} alt={item.name} loading="lazy" style={{ width: "100%", height: 190, objectFit: "cover", display: "block", background: "#eee8d9" }} />
            <div style={{ padding: 18, display: "flex", flexDirection: "column", flex: 1 }}>
              <p style={{ color: "#a97b2c", letterSpacing: 1.4, fontWeight: 800, fontSize: 10, textTransform: "uppercase", margin: "0 0 8px" }}>{item.category}</p>
              <h2 style={{ fontSize: 19, margin: "0 0 9px" }}>{item.name}</h2>
              <p style={{ color: "#667067", fontSize: 13, lineHeight: 1.65, margin: "0 0 18px", flex: 1 }}>{item.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 15 }}>
                <strong style={{ fontSize: 19 }}>{kes(item.price)}</strong>
                <span style={{ color: "#667067", fontSize: 10 }}>Indicative price</span>
              </div>
              <a href={orderLink(item.name)} target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", padding: 13, borderRadius: 7, background: "#344b38", color: "white", fontSize: 12, fontWeight: 800 }}>Ask about this dish ↗</a>
            </div>
          </article>
        ))}
      </section>

      <section style={{ background: "#344b38", color: "#fffdf8", padding: "38px 24px" }}>
        <div style={{ maxWidth: 1112, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 24, alignItems: "center" }}>
          <div><p style={{ color: "#e5bd72", fontSize: 10, letterSpacing: 2, fontWeight: 800 }}>QUESTIONS OR CUSTOM ORDERS?</p><h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 500, margin: "10px 0" }}>Talk to FoodLink.</h2><p style={{ color: "#e1e5dc", lineHeight: 1.7, fontSize: 14 }}>Ask about catering, menus, dietary needs, availability or joining our food network.</p></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
            <a href={`https://wa.me/${contactNumber}?text=Hello%20FoodLink%2C%20I%20have%20a%20question.`} target="_blank" rel="noreferrer" style={{ background: "#e2b965", color: "#1c241d", borderRadius: 7, padding: "14px 18px", fontWeight: 800, fontSize: 13 }}>WhatsApp 0768 395 450 ↗</a>
            <a href="tel:+254768395450" style={{ color: "#fffdf8", fontSize: 13 }}>Call +254 768 395 450</a>
            <Link href="/" style={{ color: "#e5bd72", fontSize: 13 }}>Back to FoodLink home ↗</Link>
          </div>
        </div>
      </section>
      <footer style={{ padding: 22, textAlign: "center", color: "#667067", fontSize: 11 }}>© {new Date().getFullYear()} FoodLink Kenya · Sample menu and indicative prices. Confirm details before ordering.</footer>
    </main>
  );
}
