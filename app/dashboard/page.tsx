"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import VendorOrders, { type VendorOrder } from "./VendorOrders";

type Profile = { fullName?: string; role?: string; isVerified?: boolean };
type OrderDoc = VendorOrder & { vendorId?: string; vendorOwnerId?: string; items?: VendorOrder["order_items"] };
const labels: Record<string,string> = { customer: "Customer", chef: "Chef or food business", rider: "Delivery partner", supplier: "Supplier", admin: "Administrator" };

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [vendorName, setVendorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async current => {
      if (!active) return;
      if (!current) { router.replace("/login?next=%2Fdashboard"); return; }
      setUser(current);
      try {
        const db = getFirebaseDb();
        const profileSnap = await getDoc(doc(db, "profiles", current.uid));
        const p = profileSnap.exists() ? profileSnap.data() as Profile : { fullName: current.displayName || "", role: "customer", isVerified: false };
        if (!active) return;
        setProfile(p);
        if (p.role === "chef") {
          const vendorSnap = await getDocs(query(collection(db, "vendors"), where("ownerId", "==", current.uid), limit(1)));
          if (!vendorSnap.empty) {
            const vendor = vendorSnap.docs[0];
            setVendorName(String(vendor.data().businessName || "FoodLink partner"));
            const orderSnap = await getDocs(query(collection(db, "orders"), where("vendorOwnerId", "==", current.uid), orderBy("createdAt", "desc"), limit(50)));
            if (active) setOrders(orderSnap.docs.map(d => { const o = { id: d.id, ...d.data() } as OrderDoc; return { ...o, order_items: o.items || o.order_items || [] }; }));
          }
        }
      } catch {
        if (active) setError("Could not load your account data. Confirm Firebase is configured and Firestore rules are deployed.");
      } finally { if (active) setLoading(false); }
    });
    return () => { active = false; unsubscribe(); };
  }, [router]);

  async function leave() { await signOut(getFirebaseAuth()); router.replace("/login"); }
  const role = profile?.role || "customer";
  const name = profile?.fullName || user?.displayName || user?.email?.split("@")[0] || "FoodLink member";

  return <main style={{ minHeight: "100vh", background: "#f8f6ef", color: "#1c241d" }}>
    <header style={{ padding: "22px max(24px, calc((100vw - 1100px) / 2))", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e6e2d7" }}><Link href="/" style={{ fontSize: 23, fontWeight: 700 }}>food<span style={{ color: "#a97b2c" }}>link</span></Link><button onClick={leave} style={{ border: "1px solid #dedacd", borderRadius: 6, background: "#fffdf8", padding: "10px 14px", cursor: "pointer" }}>Sign out</button></header>
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px" }}>
      <p style={{ color: "#a97b2c", letterSpacing: 2, fontSize: 11, fontWeight: 700 }}>FOODLINK MEMBER SPACE</p><h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(36px, 5vw, 54px)", fontWeight: 500, margin: "14px 0" }}>Welcome, {name}.</h1>
      <p style={{ color: "#667067", lineHeight: 1.7, maxWidth: 600 }}>Your FoodLink account connects you to the food ecosystem. Use the tools enabled for your account below.</p>
      {loading && <p>Loading your account…</p>}{error && <p role="alert" style={{ padding: 12, borderRadius: 7, background: "#f8e8df" }}>{error}</p>}
      {!loading && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 32 }}>
        <article style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, padding: 22 }}><p style={{ color: "#667067", fontSize: 12, margin: 0 }}>ACCOUNT TYPE</p><h2 style={{ fontSize: 22, margin: "12px 0" }}>{labels[role] || "Member"}</h2><p style={{ fontSize: 13, color: "#667067", marginBottom: 0 }}>Partner roles are approved by FoodLink administrators.</p></article>
        <article style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, padding: 22 }}><p style={{ color: "#667067", fontSize: 12, margin: 0 }}>VERIFICATION</p><h2 style={{ fontSize: 22, margin: "12px 0" }}>{profile?.isVerified ? "Verified" : "Not yet verified"}</h2><p style={{ fontSize: 13, color: "#667067", marginBottom: 0 }}>Partner verification is required before operating on the platform.</p></article>
        <article style={{ background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, padding: 22 }}><p style={{ color: "#667067", fontSize: 12, margin: 0 }}>NEXT MILESTONE</p><h2 style={{ fontSize: 22, margin: "12px 0" }}>Marketplace</h2><p style={{ fontSize: 13, color: "#667067", marginBottom: 0 }}>Browse sample food listings. Live payments are not enabled yet.</p></article>
      </div>}
      {role === "chef" && vendorName && <VendorOrders initialOrders={orders} />}
      {role === "chef" && !vendorName && !loading && <div style={{ marginTop: 32, padding: 22, background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12 }}><h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 500 }}>Set up your food business</h2><p style={{ color: "#667067", lineHeight: 1.7, fontSize: 13 }}>Your chef account has no vendor profile yet. A FoodLink administrator must approve and activate your business.</p></div>}
      <p style={{ marginTop: 32, display: "flex", gap: 18, flexWrap: "wrap" }}><Link href="/marketplace" style={{ color: "#a97b2c", fontWeight: 700 }}>Browse marketplace ↗</Link><Link href="/orders" style={{ color: "#a97b2c", fontWeight: 700 }}>My orders ↗</Link><Link href="/menu" style={{ color: "#a97b2c", fontWeight: 700 }}>Explore sample menu ↗</Link><Link href="/" style={{ color: "#a97b2c", fontWeight: 700 }}>← Return to homepage</Link></p>
    </section>
  </main>;
}
