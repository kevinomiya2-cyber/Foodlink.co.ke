"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";

export default function LoginPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/dashboard");
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedNext = params.get("next");
    if (requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//")) setNextPath(requestedNext);
  }, []);

  async function handleGoogleSignIn() {
    setBusy(true); setMessage(""); setError("");
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      const profileRef = doc(db, "profiles", credential.user.uid);
      const profile = await getDoc(profileRef);
      if (!profile.exists()) {
        await setDoc(profileRef, {
          uid: credential.user.uid,
          fullName: credential.user.displayName || credential.user.email?.split("@")[0] || "FoodLink customer",
          email: credential.user.email,
          phone: "",
          role: "customer",
          isVerified: credential.user.emailVerified,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      router.push(nextPath);
      router.refresh();
    } catch (caught) {
      const code = caught && typeof caught === "object" && "code" in caught ? String((caught as {code:string}).code) : "";
      const friendly: Record<string,string> = {
        "auth/popup-closed-by-user": "Google sign-in was cancelled. Try again when ready.",
        "auth/popup-blocked": "Your browser blocked the Google sign-in window. Allow pop-ups and try again.",
        "auth/unauthorized-domain": "This website domain is not yet authorized in Firebase Authentication settings.",
        "auth/operation-not-allowed": "Google sign-in is not enabled in Firebase Authentication yet.",
        "permission-denied": "Firebase Firestore permissions are not configured yet. Deploy the Firestore rules from the project repository.",
      };
      setError(friendly[code] || (caught instanceof Error ? caught.message : "Google sign-in could not be completed. Check Firebase setup and try again."));
    } finally { setBusy(false); }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(""); setError("");
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();
      if (mode === "signup") {
        if (fullName.trim().length < 2) throw new Error("Enter your full name.");
        if (password.length < 8) throw new Error("Use a password with at least 8 characters.");
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(credential.user, { displayName: fullName.trim() });
        await setDoc(doc(db, "profiles", credential.user.uid), {
          uid: credential.user.uid,
          fullName: fullName.trim(),
          email: credential.user.email,
          phone: "",
          role: "customer",
          isVerified: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        try { await sendEmailVerification(credential.user); } catch { /* Account creation remains successful if email delivery is temporarily unavailable. */ }
        router.push("/dashboard");
        router.refresh();
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        router.push(nextPath);
        router.refresh();
      }
    } catch (caught) {
      const code = caught && typeof caught === "object" && "code" in caught ? String((caught as {code:string}).code) : "";
      const friendly: Record<string,string> = {
        "auth/email-already-in-use": "An account already exists with this email. Sign in instead.",
        "auth/invalid-credential": "Email or password is incorrect.",
        "auth/invalid-email": "Enter a valid email address.",
        "auth/weak-password": "Choose a stronger password with at least 8 characters.",
        "auth/too-many-requests": "Too many attempts. Wait a little and try again.",
        "auth/network-request-failed": "Network connection failed. Check your internet and try again.",
        "permission-denied": "Firebase Firestore permissions are not configured yet. Deploy the Firestore rules from the project repository.",
      };
      setError(friendly[code] || (caught instanceof Error ? caught.message : "We could not complete that request. Check Firebase setup and try again."));
    } finally { setBusy(false); }
  }

  const fieldStyle = { width: "100%", padding: "13px 14px", border: "1px solid #dedacd", borderRadius: 7, background: "#fffdf8", color: "#1c241d", font: "inherit", marginTop: 7, marginBottom: 16 } as const;

  return (
    <main style={{ minHeight: "100vh", background: "#f8f6ef", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 460px)", color: "#1c241d" }}>
      <section style={{ padding: "clamp(28px, 6vw, 84px)", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#344b38", color: "#fffdf8" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 23, width: "fit-content" }}><span style={{ display: "grid", placeItems: "center", width: 42, height: 42, borderRadius: 12, background: "#f8f6ef", color: "#a97b2c", fontFamily: "Georgia, serif", fontSize: 27 }}>F</span><span>food<span style={{ color: "#e2bd76" }}>link</span></span></Link>
        <div style={{ maxWidth: 560, padding: "70px 0" }}><p style={{ color: "#e2bd76", letterSpacing: 2, fontSize: 11, fontWeight: 700 }}>ONE NETWORK. EVERY PLATE.</p><h1 style={{ fontFamily: "Georgia, serif", fontWeight: 500, fontSize: "clamp(40px, 5vw, 68px)", lineHeight: 1.08, margin: "20px 0" }}>Good food works better <em style={{ color: "#e2bd76" }}>together.</em></h1><p style={{ color: "#e1e5db", lineHeight: 1.8, maxWidth: 450 }}>One place for customers, chefs, suppliers, and delivery partners to connect and grow Kenya's food economy.</p></div>
        <p style={{ color: "#cbd3c6", fontSize: 12 }}>Starting in Nairobi and Kiambu, Kenya.</p>
      </section>
      <section style={{ padding: "32px clamp(24px, 5vw, 64px)", display: "grid", placeItems: "center" }}><div style={{ width: "100%", maxWidth: 390 }}>
        <Link href="/" style={{ display: "inline-block", marginBottom: 38, color: "#667067", fontSize: 13 }}>← Back to FoodLink</Link>
        <p style={{ color: "#a97b2c", letterSpacing: 1.8, fontSize: 10, fontWeight: 700 }}>YOUR FOODLINK ACCOUNT</p><h2 style={{ fontFamily: "Georgia, serif", fontSize: 38, fontWeight: 500, margin: "12px 0" }}>{mode === "signup" ? "Join the network." : "Welcome back."}</h2>
        <p style={{ color: "#667067", lineHeight: 1.7, marginBottom: 24 }}>{mode === "signup" ? "Create an account to get started. New accounts begin as customers; partner roles are approved separately." : "Sign in to continue to your FoodLink dashboard."}</p>
        {message && <p role="status" style={{ background: "#e8f0e3", padding: 12, borderRadius: 7, fontSize: 13, lineHeight: 1.6 }}>{message}</p>}
        {error && <p role="alert" style={{ background: "#f8e8df", padding: 12, borderRadius: 7, fontSize: 13, lineHeight: 1.6 }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {mode === "signup" && <label style={{ display: "block", fontSize: 13, fontWeight: 600 }}>Full name<input required minLength={2} autoComplete="name" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name" style={fieldStyle} /></label>}
          <label style={{ display: "block", fontSize: 13, fontWeight: 600 }}>Email address<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={fieldStyle} /></label>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600 }}>Password<input required type="password" minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" style={fieldStyle} /></label>
          <button disabled={busy} type="submit" style={{ width: "100%", padding: 15, border: 0, borderRadius: 7, background: "#344b38", color: "white", fontWeight: 700, fontSize: 14, cursor: busy ? "wait" : "pointer", opacity: busy ? 0.7 : 1 }}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"} <span style={{ color: "#e2bd76", marginLeft: 8 }}>↗</span></button>
        </form>
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0", color: "#858b81", fontSize: 11 }}><span style={{ height: 1, background: "#dedacd", flex: 1 }} />OR CONTINUE WITH<span style={{ height: 1, background: "#dedacd", flex: 1 }} /></div>
        <button type="button" disabled={busy} onClick={handleGoogleSignIn} style={{ width: "100%", padding: 14, border: "1px solid #dedacd", borderRadius: 7, background: "#fffdf8", color: "#1c241d", fontWeight: 700, fontSize: 14, cursor: busy ? "wait" : "pointer", opacity: busy ? 0.7 : 1 }}>Continue with Google</button>
        <p style={{ textAlign: "center", color: "#667067", fontSize: 13, marginTop: 22 }}>{mode === "signup" ? "Already have an account?" : "New to FoodLink?"}{" "}<button type="button" onClick={()=>{setMode(mode === "signup" ? "login" : "signup");setError("");setMessage("");}} style={{ border: 0, background: "transparent", color: "#a97b2c", fontWeight: 700, cursor: "pointer", font: "inherit" }}>{mode === "signup" ? "Sign in" : "Create account"}</button></p>
        <p style={{ fontSize: 11, lineHeight: 1.6, color: "#858b81", textAlign: "center", marginTop: 28 }}>By continuing, you agree to use FoodLink responsibly. Account creation does not grant chef, supplier, rider, or admin privileges.</p>
      </div></section>
      <style jsx>{`@media (max-width: 760px) { main { grid-template-columns: 1fr !important; } main > section:first-child { min-height: 300px; padding: 24px; } main > section:first-child > div { padding: 30px 0 !important; } main > section:first-child > p:last-child { display: none; } main > section:last-child { padding: 28px 24px 48px; } }`}</style>
    </main>
  );
}
