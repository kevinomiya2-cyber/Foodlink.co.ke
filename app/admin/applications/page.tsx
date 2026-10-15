"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Application = { id: string; user_id: string; requested_role: string; full_name: string; phone: string; business_name: string; location: string; experience: string; status: string; created_at: string };

export default function AdminApplicationsPage() {
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.app_metadata?.role !== "admin") {
      setAllowed(false); setChecked(true); return;
    }
    setAllowed(true);
    const { data, error: queryError } = await supabase.from("partner_applications").select("id,user_id,requested_role,full_name,phone,business_name,location,experience,status,created_at").order("created_at", { ascending: true });
    if (queryError) setError("Could not load applications. Confirm this account has the admin role in Supabase Auth app metadata and the migration has been applied.");
    else setApplications((data ?? []) as Application[]);
    setChecked(true);
  }, []);

  useEffect(() => { load().catch(() => { setError("Could not connect to FoodLink."); setChecked(true); }); }, [load]);

  async function review(app: Application, decision: "approved" | "rejected") {
    setBusyId(app.id); setError(""); setMessage("");
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("review_partner_application", { p_application_id: app.id, p_decision: decision, p_admin_note: "" });
    if (rpcError) setError("Review failed. Confirm your account has administrator privileges and the partner migration has been applied.");
    else { setMessage("Application " + decision + "."); await load(); }
    setBusyId("");
  }

  return <main style={{ minHeight: "100vh", background: "#f8f6ef", color: "#1c241d" }}>
    <header style={{ maxWidth: 1120, margin: "0 auto", padding: "22px 24px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e6e2d7" }}><Link href="/" style={{ fontSize: 24, fontWeight: 800 }}>food<span style={{ color: "#a97b2c" }}>link</span></Link><Link href="/dashboard" style={{ fontWeight: 700 }}>My account ↗</Link></header>
    <section style={{ maxWidth: 1120, margin: "0 auto", padding: "38px 24px 70px" }}>
      <p style={{ color: "#a97b2c", letterSpacing: 2, fontSize: 10, fontWeight: 800 }}>ADMINISTRATION</p><h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(36px,6vw,54px)", fontWeight: 500, margin: "12px 0" }}>Partner <em>applications.</em></h1><p style={{ color: "#667067", lineHeight: 1.8 }}>Review each application before enabling partner capabilities. Approving a chef creates an inactive vendor profile that must be activated separately.</p>
      {!checked && <p>Checking administrator access…</p>}
      {checked && !allowed && <div role="alert" style={{ background: "#f8e8df", padding: 18, borderRadius: 8, lineHeight: 1.7 }}>Administrator access required. Sign in with an account whose Supabase Auth <code>app_metadata.role</code> is set to <code>admin</code>. A normal profile role is not enough.</div>}
      {error && <p role="alert" style={{ background: "#f8e8df", padding: 12, borderRadius: 7, lineHeight: 1.6 }}>{error}</p>}
      {message && <p role="status" style={{ background: "#e8f0e3", padding: 12, borderRadius: 7 }}>{message}</p>}
      {allowed && applications.length === 0 && <div style={{ marginTop: 24, background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 10, padding: 24, color: "#667067" }}>No partner applications yet.</div>}
      {allowed && <div style={{ display: "grid", gap: 14, marginTop: 24 }}>{applications.map(app=><article key={app.id} style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, padding: 22 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div><p style={{ margin: "0 0 7px", color: "#a97b2c", fontSize: 10, fontWeight: 800, letterSpacing: 1.5 }}>{app.requested_role.toUpperCase()}</p><h2 style={{ fontFamily: "Georgia,serif", fontWeight: 500, margin: "0 0 8px", fontSize: 24 }}>{app.full_name}</h2><p style={{ margin: "0 0 6px", color: "#667067", fontSize: 13 }}>{app.business_name || "Individual partner"} · {app.location}</p><p style={{ margin: "0 0 8px", color: "#667067", fontSize: 13 }}>{app.phone}</p><p style={{ lineHeight: 1.7, fontSize: 13 }}>{app.experience || "No extra details provided."}</p></div><span style={{ fontSize: 11, fontWeight: 800, height: "fit-content", padding: "7px 10px", background: app.status === "pending" ? "#efe9d9" : "#e8f0e3", borderRadius: 20 }}>{app.status.toUpperCase()}</span></div>{app.status === "pending" && <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}><button disabled={busyId === app.id} onClick={()=>review(app,"approved")} style={{ border: 0, borderRadius: 6, padding: "11px 14px", background: "#344b38", color: "white", fontWeight: 800 }}>{busyId === app.id ? "Saving…" : "Approve partner"}</button><button disabled={busyId === app.id} onClick={()=>review(app,"rejected")} style={{ border: "1px solid #dedacd", borderRadius: 6, padding: "11px 14px", background: "white", color: "#7e3526", fontWeight: 800 }}>Reject</button></div>}</article>)}</div>}
    </section>
  </main>;
}
