"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");

    try {
      const supabase = createClient();

      if (mode === "signup") {
        if (fullName.trim().length < 2) {
          setError("Enter your full name.");
          return;
        }

        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (authError) throw authError;

        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setMessage("Account created. Check your email for the confirmation link, then sign in.");
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
        const next = searchParams.get("next");
        router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
        router.refresh();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not complete that request. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const fieldStyle = {
    width: "100%",
    padding: "13px 14px",
    border: "1px solid #dedacd",
    borderRadius: 7,
    background: "#fffdf8",
    color: "#1c241d",
    font: "inherit",
    marginTop: 7,
    marginBottom: 16,
  } as const;

  return (
    <main style={{ minHeight: "100vh", background: "#f8f6ef", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 460px)", color: "#1c241d" }}>
      <section style={{ padding: "clamp(28px, 6vw, 84px)", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#344b38", color: "#fffdf8" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 23, width: "fit-content" }}>
          <span style={{ display: "grid", placeItems: "center", width: 42, height: 42, borderRadius: 12, background: "#f8f6ef", color: "#a97b2c", fontFamily: "Georgia, serif", fontSize: 27 }}>F</span>
          <span>food<span style={{ color: "#e2bd76" }}>link</span></span>
        </Link>
        <div style={{ maxWidth: 560, padding: "70px 0" }}>
          <p style={{ color: "#e2bd76", letterSpacing: 2, fontSize: 11, fontWeight: 700 }}>ONE NETWORK. EVERY PLATE.</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 500, fontSize: "clamp(40px, 5vw, 68px)", lineHeight: 1.08, margin: "20px 0" }}>Good food works better <em style={{ color: "#e2bd76" }}>together.</em></h1>
          <p style={{ color: "#e1e5db", lineHeight: 1.8, maxWidth: 450 }}>One place for customers, chefs, suppliers, and delivery partners to connect and grow Kenya's food economy.</p>
        </div>
        <p style={{ color: "#cbd3c6", fontSize: 12 }}>Starting in Nairobi and Kiambu, Kenya.</p>
      </section>

      <section style={{ padding: "32px clamp(24px, 5vw, 64px)", display: "grid", placeItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 390 }}>
          <Link href="/" style={{ display: "inline-block", marginBottom: 38, color: "#667067", fontSize: 13 }}>← Back to FoodLink</Link>
          <p style={{ color: "#a97b2c", letterSpacing: 1.8, fontSize: 10, fontWeight: 700 }}>YOUR FOODLINK ACCOUNT</p>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 38, fontWeight: 500, margin: "12px 0" }}>{mode === "signup" ? "Join the network." : "Welcome back."}</h2>
          <p style={{ color: "#667067", lineHeight: 1.7, marginBottom: 24 }}>{mode === "signup" ? "Create an account to get started. New accounts begin as customers; partner roles are approved separately." : "Sign in to continue to your FoodLink dashboard."}</p>

          {searchParams.get("error") === "confirmation" && <p role="alert" style={{ background: "#f8e8df", padding: 12, borderRadius: 7, fontSize: 13 }}>Your confirmation link could not be verified. Try signing in or request a fresh confirmation email.</p>}
          {message && <p role="status" style={{ background: "#e8f0e3", padding: 12, borderRadius: 7, fontSize: 13, lineHeight: 1.6 }}>{message}</p>}
          {error && <p role="alert" style={{ background: "#f8e8df", padding: 12, borderRadius: 7, fontSize: 13, lineHeight: 1.6 }}>{error}</p>}

          <form onSubmit={handleSubmit}>
            {mode === "signup" && <label style={{ display: "block", fontSize: 13, fontWeight: 600 }}>Full name<input required minLength={2} autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" style={fieldStyle} /></label>}
            <label style={{ display: "block", fontSize: 13, fontWeight: 600 }}>Email address<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={fieldStyle} /></label>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600 }}>Password<input required type="password" minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" style={fieldStyle} /></label>
            <button disabled={busy} type="submit" style={{ width: "100%", padding: 15, border: 0, borderRadius: 7, background: "#344b38", color: "white", fontWeight: 700, fontSize: 14, cursor: busy ? "wait" : "pointer", opacity: busy ? 0.7 : 1 }}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"} <span style={{ color: "#e2bd76", marginLeft: 8 }}>↗</span></button>
          </form>
          <p style={{ textAlign: "center", color: "#667067", fontSize: 13, marginTop: 22 }}>
            {mode === "signup" ? "Already have an account?" : "New to FoodLink?"}{" "}
            <button type="button" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); setMessage(""); }} style={{ border: 0, background: "transparent", color: "#a97b2c", fontWeight: 700, cursor: "pointer", font: "inherit" }}>{mode === "signup" ? "Sign in" : "Create account"}</button>
          </p>
          <p style={{ fontSize: 11, lineHeight: 1.6, color: "#858b81", textAlign: "center", marginTop: 28 }}>By continuing, you agree to use FoodLink responsibly. Account creation does not grant chef, supplier, rider, or admin privileges.</p>
        </div>
      </section>
      <style jsx>{`@media (max-width: 760px) { main { grid-template-columns: 1fr !important; } main > section:first-child { min-height: 300px; padding: 24px; } main > section:first-child > div { padding: 30px 0 !important; } main > section:first-child > p:last-child { display: none; } main > section:last-child { padding: 28px 24px 48px; } }`}</style>
    </main>
  );
}
