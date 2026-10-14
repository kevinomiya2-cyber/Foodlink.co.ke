import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, is_verified")
    .eq("id", user.id)
    .maybeSingle();

  const name = profile?.full_name || user.email?.split("@")[0] || "FoodLink member";
  const role = profile?.role || "customer";
  const roleLabels: Record<string, string> = {
    customer: "Customer",
    chef: "Chef or food business",
    rider: "Delivery partner",
    supplier: "Supplier",
    admin: "Administrator",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f8f6ef", color: "#1c241d" }}>
      <header style={{ padding: "22px max(24px, calc((100vw - 1100px) / 2))", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e6e2d7" }}>
        <Link href="/" style={{ fontSize: 23, fontWeight: 700 }}>food<span style={{ color: "#a97b2c" }}>link</span></Link>
        <form action="/auth/signout" method="post"><button style={{ border: "1px solid #dedacd", borderRadius: 6, background: "#fffdf8", padding: "10px 14px", cursor: "pointer" }}>Sign out</button></form>
      </header>
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px" }}>
        <p style={{ color: "#a97b2c", letterSpacing: 2, fontSize: 11, fontWeight: 700 }}>FOODLINK MEMBER SPACE</p>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(36px, 5vw, 54px)", fontWeight: 500, margin: "14px 0" }}>Welcome, {name}.</h1>
        <p style={{ color: "#667067", lineHeight: 1.7, maxWidth: 600 }}>Your account is connected. We are building out the marketplace and partner tools next, so this dashboard currently shows your account status rather than pretending the full platform already exists.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 32 }}>
          <article style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, padding: 22 }}>
            <p style={{ color: "#667067", fontSize: 12, margin: 0 }}>ACCOUNT TYPE</p><h2 style={{ fontSize: 22, margin: "12px 0" }}>{roleLabels[role] || "Member"}</h2><p style={{ fontSize: 13, color: "#667067", marginBottom: 0 }}>Partner roles are approved by FoodLink administrators.</p>
          </article>
          <article style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, padding: 22 }}>
            <p style={{ color: "#667067", fontSize: 12, margin: 0 }}>VERIFICATION</p><h2 style={{ fontSize: 22, margin: "12px 0" }}>{profile?.is_verified ? "Verified" : "Not yet verified"}</h2><p style={{ fontSize: 13, color: "#667067", marginBottom: 0 }}>Verification will be required before operating as a platform partner.</p>
          </article>
          <article style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, padding: 22 }}>
            <p style={{ color: "#667067", fontSize: 12, margin: 0 }}>NEXT MILESTONE</p><h2 style={{ fontSize: 22, margin: "12px 0" }}>Marketplace</h2><p style={{ fontSize: 13, color: "#667067", marginBottom: 0 }}>Live vendor listings and ordering will be connected after the database is configured.</p>
          </article>
        </div>
        <p style={{ marginTop: 32 }}><Link href="/" style={{ color: "#a97b2c", fontWeight: 700 }}>← Return to the homepage</Link></p>
      </section>
    </main>
  );
}
