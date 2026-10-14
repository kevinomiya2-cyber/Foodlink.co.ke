import Link from "next/link";

const phone = "254768395450";
const message = encodeURIComponent("Hello FoodLink, I have a question about the platform.");

export default function ContactPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8f6ef", color: "#1c241d" }}>
      <header style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e6e2d7" }}>
        <Link href="/" style={{ fontSize: 24, fontWeight: 700, textDecoration: "none", color: "inherit" }}>food<span style={{ color: "#a97b2c" }}>link</span></Link>
        <Link href="/marketplace" style={{ color: "#344b38", fontWeight: 600 }}>Browse food ↗</Link>
      </header>
      <section style={{ maxWidth: 850, margin: "0 auto", padding: "clamp(36px, 8vw, 90px) 24px" }}>
        <p style={{ color: "#a97b2c", letterSpacing: 2, fontSize: 11, fontWeight: 700 }}>WE ARE HERE TO HELP</p>
        <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 500, fontSize: "clamp(40px, 7vw, 68px)", lineHeight: 1.05, margin: "16px 0" }}>Let's talk <em>FoodLink.</em></h1>
        <p style={{ maxWidth: 620, color: "#667067", lineHeight: 1.8 }}>Questions about an order, joining as a chef, becoming a supplier, or partnering with FoodLink? Contact our team directly.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16, marginTop: 32 }}>
          <a href={`https://wa.me/${phone}?text=${message}`} style={{ display: "block", textDecoration: "none", background: "#344b38", color: "#fffdf8", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 28 }}>☏</div><h2 style={{ fontSize: 22, margin: "12px 0 8px" }}>WhatsApp us</h2><p style={{ lineHeight: 1.7, opacity: .9 }}>0768 395 450</p><strong>Start a conversation ↗</strong>
          </a>
          <a href="tel:+254768395450" style={{ display: "block", textDecoration: "none", background: "#fffdf8", color: "#1c241d", border: "1px solid #e6e2d7", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 28 }}>☎</div><h2 style={{ fontSize: 22, margin: "12px 0 8px" }}>Call FoodLink</h2><p style={{ lineHeight: 1.7, color: "#667067" }}>0768 395 450</p><strong>Call now ↗</strong>
          </a>
        </div>
        <div style={{ marginTop: 28, padding: 22, background: "#efe9d9", borderRadius: 12 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 500 }}>M-Pesa payments</h2>
          <p style={{ color: "#52624f", lineHeight: 1.7 }}>FoodLink is preparing secure M-Pesa checkout. Until official Safaricom Daraja credentials and a business payment setup are registered and tested, we will confirm payment instructions directly. Never send money to an unverified number.</p>
        </div>
        <Link href="/" style={{ display: "inline-block", marginTop: 28, color: "#344b38", fontWeight: 700 }}>← Back to FoodLink home</Link>
      </section>
      <footer style={{ padding: 24, background: "#344b38", color: "#fffdf8", textAlign: "center", fontSize: 12 }}>FOODLINK · ONE NETWORK. EVERY PLATE.</footer>
    </main>
  );
}
