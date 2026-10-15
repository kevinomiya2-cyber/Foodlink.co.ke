"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Health = {
  status?: string;
  message?: string;
  checks?: Record<string, string | number>;
  nextStep?: string;
};

export default function StatusPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      const result = (await response.json()) as Health;
      setHealth(result);
    } catch {
      setFailed(true);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  const connected = health?.status === "connected";
  const missing = health?.status === "needs_configuration";

  return (
    <main style={{ minHeight: "100vh", background: "#f8f6ef", color: "#1c241d", padding: "28px 20px 64px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-block", color: "#667067", marginBottom: 32 }}>← Back to FoodLink</Link>
        <p style={{ color: "#a97b2c", letterSpacing: 2, fontSize: 11, fontWeight: 700 }}>FOODLINK SYSTEM CHECK</p>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(36px, 7vw, 54px)", fontWeight: 500, margin: "12px 0" }}>Let’s check the connection.</h1>
        <p style={{ color: "#667067", lineHeight: 1.8 }}>This page checks whether the live website can reach the Firebase Authentication and Cloud Firestore. It never displays your keys.</p>

        <section aria-live="polite" style={{ marginTop: 28, background: "#fffdf8", border: "1px solid #e6e2d7", borderRadius: 14, padding: "clamp(20px, 5vw, 32px)" }}>
          {loading ? (
            <p>Checking FoodLink configuration…</p>
          ) : failed ? (
            <>
              <h2 style={{ marginTop: 0 }}>The status check could not load.</h2>
              <p style={{ color: "#667067", lineHeight: 1.7 }}>The website may still be deploying, or its status endpoint may be unavailable.</p>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: 42, height: 42, borderRadius: 50, background: connected ? "#e5efdf" : "#f8e8df", color: connected ? "#37613b" : "#8b4932", fontSize: 22 }}>{connected ? "✓" : "!"}</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22 }}>{connected ? "Firebase is reachable" : missing ? "Setup is incomplete" : "Connection needs attention"}</h2>
                  <p style={{ margin: "5px 0 0", color: "#667067", fontSize: 13 }}>{health?.message}</p>
                </div>
              </div>
              <div style={{ borderTop: "1px solid #e6e2d7", borderBottom: "1px solid #e6e2d7", padding: "14px 0", margin: "18px 0" }}>
                {Object.entries(health?.checks ?? {}).map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "8px 0", fontSize: 13 }}>
                    <span style={{ color: "#667067" }}>{label.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}</span>
                    <strong style={{ textAlign: "right", overflowWrap: "anywhere" }}>{String(value)}</strong>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.8 }}>{health?.nextStep}</p>
            </>
          )}
          <button type="button" onClick={() => void checkHealth()} disabled={loading} style={{ marginTop: 12, padding: "13px 17px", border: 0, borderRadius: 7, background: "#344b38", color: "#fffdf8", fontWeight: 700, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}>Check again</button>
        </section>

        <p style={{ marginTop: 20, fontSize: 12, color: "#667067", lineHeight: 1.7 }}>A successful connection check does not by itself prove that signup, email delivery, database policies, or ordering work. Those require separate tests.</p>
      </div>
    </main>
  );
}
