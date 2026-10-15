import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const roleCards: Record<string, { title: string; description: string; href: string; action: string }[]> = {
  customer: [
    { title: "Explore food", description: "Browse meals and discover local food businesses.", href: "/marketplace", action: "Open marketplace" },
    { title: "Apply as a partner", description: "Join as a chef, supplier or delivery rider. Applications are reviewed.", href: "/apply", action: "Start application" },
  ],
  chef: [
    { title: "Manage menu", description: "Create menu items and control availability.", href: "/chef/menu", action: "Manage menu" },
    { title: "Manage orders", description: "Review and update orders for your food business.", href: "/dashboard", action: "Open orders" },
    { title: "Browse marketplace", description: "See how customers discover FoodLink meals.", href: "/marketplace", action: "Browse food" },
  ],
  supplier: [
    { title: "Supplier catalogue", description: "List ingredients, stock and prices for food businesses.", href: "/supplier", action: "Manage products" },
    { title: "Partner status", description: "Review your account details and application status.", href: "/dashboard", action: "Open account" },
  ],
  rider: [
    { title: "Delivery jobs", description: "View assigned jobs and update delivery progress.", href: "/rider", action: "Open deliveries" },
    { title: "Partner status", description: "Review your account details and application status.", href: "/dashboard", action: "Open account" },
  ],
  admin: [
    { title: "Partner applications", description: "Approve or reject chef, supplier and rider applications.", href: "/admin/applications", action: "Review applications" },
    { title: "Marketplace", description: "Browse FoodLink listings and customer experience.", href: "/marketplace", action: "Open marketplace" },
  ],
};

export default async function WorkspacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Fworkspace");
  const { data: profile } = await supabase.from("profiles").select("full_name,role,is_verified").eq("id", user.id).maybeSingle();
  const role = user.app_metadata?.role === "admin" ? "admin" : profile?.role ?? "customer";
  const cards = roleCards[role] ?? roleCards.customer;
  return <main style={{ minHeight: "100vh", background: "#f8f6ef", color: "#1c241d" }}>
    <header style={{ maxWidth: 1120, margin: "0 auto", padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e6e2d7" }}><Link href="/" style={{ fontSize: 24, fontWeight: 800 }}>food<span style={{ color: "#a97b2c" }}>link</span></Link><Link href="/dashboard" style={{ fontWeight: 700 }}>Account details ↗</Link></header>
    <section style={{ maxWidth: 1120, margin: "0 auto", padding: "42px 24px 72px" }}>
      <p style={{ color: "#a97b2c", letterSpacing: 2, fontSize: 10, fontWeight: 800 }}>YOUR FOODLINK WORKSPACE</p>
      <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(38px,6vw,58px)", lineHeight: 1.08, fontWeight: 500, margin: "14px 0" }}>Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.</h1>
      <p style={{ color: "#667067", lineHeight: 1.8 }}>Your account role is <strong>{role}</strong>. Use the tools available to your account below. Partner and administrator permissions are granted only through review.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,270px),1fr))", gap: 16, marginTop: 30 }}>
        {cards.map(card => <article key={card.href + card.title} style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, padding: 24 }}><h2 style={{ fontFamily: "Georgia,serif", fontSize: 24, fontWeight: 500, margin: "0 0 10px" }}>{card.title}</h2><p style={{ color: "#667067", fontSize: 13, lineHeight: 1.8, minHeight: 68 }}>{card.description}</p><Link href={card.href} style={{ display: "inline-block", background: "#344b38", color: "white", padding: "12px 15px", borderRadius: 6, fontSize: 12, fontWeight: 800 }}>{card.action} ↗</Link></article>)}
      </div>
      {role !== "customer" && <p style={{ marginTop: 24, color: "#667067", fontSize: 12, lineHeight: 1.7 }}>Partner tools are subject to account approval and the current stage of platform setup. Orders and payments should not be treated as live until the launch checks are complete.</p>}
    </section>
  </main>;
}
