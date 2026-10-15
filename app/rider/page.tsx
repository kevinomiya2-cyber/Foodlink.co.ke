"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Job = { id: string; status: string; pickup_note: string; delivery_note: string; orders: { order_number: number; delivery_address: string; total_kes: number; status: string } | null };

const nextStatus: Record<string, string> = { assigned: "at_vendor", at_vendor: "picked_up", picked_up: "delivered" };
const nextLabel: Record<string, string> = { assigned: "Arrived at vendor", at_vendor: "Confirm pickup", picked_up: "Mark delivered" };

export default function RiderWorkspace() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sign in to access rider deliveries."); return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role !== "rider") { setError("This workspace is for approved delivery riders. Apply through the partner page first."); return; }
    setAuthorized(true);
    const { data, error: listError } = await supabase.from("delivery_jobs").select("id,status,pickup_note,delivery_note,orders(order_number,delivery_address,total_kes,status)").eq("rider_id", user.id).order("created_at", { ascending: false });
    if (listError) setError("Could not load deliveries. Try refreshing.");
    else setJobs((data ?? []) as unknown as Job[]);
  }, []);

  useEffect(() => { load().catch(() => setError("Could not connect to FoodLink. Check your database configuration.")); }, [load]);

  async function advance(job: Job) {
    const status = nextStatus[job.status];
    if (!status) return;
    setBusyId(job.id); setError(""); setMessage("");
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("set_delivery_job_status", { p_job_id: job.id, p_status: status });
    if (rpcError) setError("We could not update this delivery. Confirm it is assigned to your account and the status transition is valid.");
    else { setMessage("Delivery updated."); await load(); }
    setBusyId("");
  }

  return <main style={{ minHeight: "100vh", background: "#f8f6ef", color: "#1c241d" }}>
    <header style={{ maxWidth: 1120, margin: "0 auto", padding: "22px 24px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e6e2d7" }}><Link href="/" style={{ fontSize: 24, fontWeight: 800 }}>food<span style={{ color: "#a97b2c" }}>link</span></Link><Link href="/dashboard" style={{ fontWeight: 700 }}>My account ↗</Link></header>
    <section style={{ maxWidth: 1000, margin: "0 auto", padding: "38px 24px 70px" }}>
      <p style={{ color: "#a97b2c", letterSpacing: 2, fontSize: 10, fontWeight: 800 }}>RIDER WORKSPACE</p><h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(36px,6vw,54px)", fontWeight: 500, margin: "12px 0" }}>Every delivery <em>counts.</em></h1><p style={{ color: "#667067", lineHeight: 1.8 }}>Your assigned jobs appear here. Update each job as you arrive, collect the order, and complete delivery.</p>
      {error && <p role="alert" style={{ background: "#f8e8df", padding: 12, borderRadius: 7, lineHeight: 1.6 }}>{error}</p>}
      {message && <p role="status" style={{ background: "#e8f0e3", padding: 12, borderRadius: 7 }}>{message}</p>}
      {authorized && jobs.length === 0 && <div style={{ marginTop: 24, background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 10, padding: 24, color: "#667067" }}>No delivery jobs are assigned to you yet.</div>}
      {authorized && <div style={{ display: "grid", gap: 14, marginTop: 24 }}>{jobs.map(job=><article key={job.id} style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, padding: 22 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><h2 style={{ margin: 0, fontFamily: "Georgia,serif", fontWeight: 500, fontSize: 24 }}>Order #{job.orders?.order_number ?? "Pending"}</h2><span style={{ background: "#efe9d9", borderRadius: 20, padding: "7px 10px", fontSize: 11, fontWeight: 800 }}>{job.status.replaceAll("_", " ").toUpperCase()}</span></div><p style={{ color: "#667067", lineHeight: 1.7 }}>{job.orders?.delivery_address ?? "Delivery address not available"}</p>{job.pickup_note && <p style={{ fontSize: 12 }}>Pickup note: {job.pickup_note}</p>}{job.delivery_note && <p style={{ fontSize: 12 }}>Delivery note: {job.delivery_note}</p>}<p style={{ fontWeight: 800 }}>Order total: KES {(job.orders?.total_kes ?? 0).toLocaleString("en-KE")}</p>{nextStatus[job.status] ? <button disabled={busyId === job.id} onClick={()=>advance(job)} style={{ border: 0, borderRadius: 6, padding: 13, background: "#344b38", color: "white", fontWeight: 800, cursor: "pointer" }}>{busyId === job.id ? "Updating…" : nextLabel[job.status]}</button> : <p style={{ color: "#667067", fontSize: 12 }}>No further rider action is available for this job.</p>}</article>)}</div>}
    </section>
  </main>;
}
