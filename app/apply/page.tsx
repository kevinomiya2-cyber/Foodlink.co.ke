"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type PartnerRole = "chef" | "supplier" | "rider";

export default function PartnerApplicationPage() {
  const router = useRouter();
  const [role, setRole] = useState<PartnerRole>("chef");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data, error: authError }) => {
      if (authError || !data.user) {
        setSignedIn(false);
        return;
      }
      setSignedIn(true);
      setFullName(String(data.user.user_metadata?.full_name ?? ""));
    }).catch(() => setSignedIn(false));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login?next=%2Fapply");
        return;
      }
      const { error: insertError } = await supabase.from("partner_applications").insert({
        user_id: user.id,
        requested_role: role,
        full_name: fullName.trim(),
        phone: phone.trim(),
        business_name: businessName.trim(),
        location: location.trim(),
        experience: experience.trim(),
      });
      if (insertError) {
        if (insertError.code === "23505") throw new Error("You already have an application on record. Contact FoodLink if you need to update it.");
        throw new Error("We could not submit your application. Confirm the partner-onboarding database migration has been applied, then try again.");
      }
      setMessage("Application submitted. FoodLink will review your details before enabling partner tools. You can continue browsing while you wait.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not submit your application. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const fieldStyle = { width: "100%", boxSizing: "border-box" as const, padding: "13px 14px", marginTop: 7, border: "1px solid #dedacd", borderRadius: 7, background: "#fffdf8", color: "#1c241d", font: "inherit" };

  return (
    <main style={{ minHeight: "100vh", background: "#f8f6ef", color: "#1c241d" }}>
      <header style={{ maxWidth: 1120, margin: "0 auto", padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e6e2d7" }}>
        <Link href="/" style={{ fontSize: 24, fontWeight: 800 }}>food<span style={{ color: "#a97b2c" }}>link</span></Link>
        <Link href="/dashboard" style={{ color: "#344b38", fontWeight: 700, fontSize: 13 }}>My account ↗</Link>
      </header>
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(32px, 7vw, 72px) 24px" }}>
        <p style={{ color: "#a97b2c", letterSpacing: 2, fontSize: 10, fontWeight: 800 }}>BECOME A FOODLINK PARTNER</p>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(40px, 7vw, 64px)", lineHeight: 1.05, fontWeight: 500, margin: "16px 0" }}>Your work belongs in <em style={{ color: "#a97b2c" }}>the network.</em></h1>
        <p style={{ maxWidth: 620, color: "#667067", lineHeight: 1.8 }}>Apply to join as a chef or food business, ingredient supplier, or delivery rider. For safety and trust, partner tools are enabled only after FoodLink reviews your application.</p>

        {signedIn === false && <div role="status" style={{ marginTop: 24, padding: 18, background: "#efe9d9", borderRadius: 8, lineHeight: 1.7 }}>Sign in or create a customer account before applying. <Link href="/login?next=%2Fapply" style={{ color: "#344b38", fontWeight: 800 }}>Continue to sign in ↗</Link></div>}
        {message && <div role="status" style={{ marginTop: 24, padding: 18, background: "#e8f0e3", borderRadius: 8, lineHeight: 1.7 }}>{message}<p><Link href="/dashboard" style={{ color: "#344b38", fontWeight: 800 }}>Return to your account ↗</Link></p></div>}
        {error && <p role="alert" style={{ marginTop: 20, padding: 14, background: "#f8e8df", borderRadius: 8, lineHeight: 1.7 }}>{error}</p>}

        {!message && <form onSubmit={submit} style={{ marginTop: 28, padding: "clamp(20px, 4vw, 34px)", background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 12, display: "grid", gap: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 700 }}>Partner type
            <select value={role} onChange={e => setRole(e.target.value as PartnerRole)} style={fieldStyle}>
              <option value="chef">Chef, restaurant or caterer</option>
              <option value="supplier">Ingredient or food-product supplier</option>
              <option value="rider">Delivery rider</option>
            </select>
          </label>
          <label style={{ fontSize: 13, fontWeight: 700 }}>Full name
            <input required minLength={2} autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} style={fieldStyle} placeholder="Your full name" />
          </label>
          <label style={{ fontSize: 13, fontWeight: 700 }}>Phone number
            <input required type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} style={fieldStyle} placeholder="07xx xxx xxx" />
          </label>
          {role === "chef" && <label style={{ fontSize: 13, fontWeight: 700 }}>Business or kitchen name
            <input required value={businessName} onChange={e => setBusinessName(e.target.value)} style={fieldStyle} placeholder="Your kitchen or business name" />
          </label>}
          {role === "supplier" && <label style={{ fontSize: 13, fontWeight: 700 }}>Supplier or business name
            <input required value={businessName} onChange={e => setBusinessName(e.target.value)} style={fieldStyle} placeholder="Your supplier business" />
          </label>}
          <label style={{ fontSize: 13, fontWeight: 700 }}>Town, estate or service area
            <input required minLength={2} value={location} onChange={e => setLocation(e.target.value)} style={fieldStyle} placeholder="e.g. Limuru, Kiambu" />
          </label>
          <label style={{ fontSize: 13, fontWeight: 700 }}>Experience and details (optional)
            <textarea value={experience} onChange={e => setExperience(e.target.value)} maxLength={1500} rows={4} style={fieldStyle} placeholder="Tell us about your experience, products, or delivery setup." />
          </label>
          <button type="submit" disabled={busy || signedIn !== true} style={{ border: 0, borderRadius: 7, padding: 15, background: "#344b38", color: "#fffdf8", fontSize: 14, fontWeight: 800, cursor: busy ? "wait" : "pointer", opacity: busy || signedIn !== true ? .55 : 1 }}>{busy ? "Submitting application…" : "Submit partner application ↗"}</button>
          <p style={{ color: "#667067", fontSize: 11, lineHeight: 1.7, margin: 0 }}>Submitting an application does not guarantee approval. Never send identity documents or money through unofficial links.</p>
        </form>}
      </section>
      <footer style={{ padding: 24, background: "#344b38", color: "#fffdf8", textAlign: "center", fontSize: 11 }}>FOODLINK · ONE NETWORK. EVERY PLATE.</footer>
    </main>
  );
}
