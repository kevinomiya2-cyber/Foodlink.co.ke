import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VendorOrders, { type VendorOrder } from "./VendorOrders";

export const dynamic = "force-dynamic";

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
  let vendorName = "";
  let vendorOrders: VendorOrder[] = [];
  if (role === "chef") {
    const { data: vendor } = await supabase.from("vendors").select("id, business_name").eq("owner_id", user.id).maybeSingle();
    if (vendor) {
      vendorName = vendor.business_name;
      const { data: orders } = await supabase.from("orders")
        .select("id, order_number, status, subtotal_kes, total_kes, created_at, delivery_address, customer_note, order_items(item_name, quantity, line_total_kes)")
        .eq("vendor_id", vendor.id).order("created_at", { ascending: false }).limit(50);
      vendorOrders = (orders ?? []) as unknown as VendorOrder[];
    }
  }

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
        <p style={{ color: "#667067", lineHeight: 1.7, maxWidth: 600 }}>Your FoodLink account is connected. From here you can check your account status and access the tools currently enabled for your role.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 32 }}>
          <article style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, padding: 22 }}>
            <p style={{ color: "#667067", fontSize: 12, margin: 0 }}>ACCOUNT TYPE</p><h2 style={{ fontSize: 22, margin: "12px 0" }}>{roleLabels[role] || "Member"}</h2><p style={{ fontSize: 13, color: "#667067", marginBottom: 0 }}>Partner roles are approved by FoodLink administrators.</p>
          </article>
          <article style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, padding: 22 }}>
            <p style={{ color: "#667067", fontSize: 12, margin: 0 }}>VERIFICATION</p><h2 style={{ fontSize: 22, margin: "12px 0" }}>{profile?.is_verified ? "Verified" : "Not yet verified"}</h2><p style={{ fontSize: 13, color: "#667067", marginBottom: 0 }}>Verification will be required before operating as a platform partner.</p>
          </article>
          <article style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, padding: 22 }}>
            <p style={{ color: "#667067", fontSize: 12, margin: 0 }}>NEXT MILESTONE</p><h2 style={{ fontSize: 22, margin: "12px 0" }}>Marketplace</h2><p style={{ fontSize: 13, color: "#667067", marginBottom: 0 }}>Browse available food and place unpaid test orders while the payment and delivery services are being completed.</p>
          </article>
        </div>
        {role === "chef" && vendorName && <VendorOrders initialOrders={vendorOrders} />}
        {role === "chef" && !vendorName && <div style={{ marginTop: 32, padding: 22, background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12 }}><h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 500 }}>Set up your food business</h2><p style={{ color: "#667067", lineHeight: 1.7, fontSize: 13 }}>Your account has the chef role, but a vendor profile has not been created or approved yet. Contact the FoodLink administrator to finish partner onboarding.</p></div>}
        <p style={{ marginTop: 32, display: "flex", gap: 18, flexWrap: "wrap" }}><Link href="/marketplace" style={{ color: "#a97b2c", fontWeight: 700 }}>Browse marketplace ↗</Link><Link href="/" style={{ color: "#a97b2c", fontWeight: 700 }}>← Return to the homepage</Link></p>
      </section>
    </main>
  );
}
