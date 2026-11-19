"use client";
import { useEffect, useState, type ReactNode } from "react";
import { demoEnabled } from "@/utils/demo-mode";
import { refreshManagement } from "@/utils/management-store";

export function SharedDemoData({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!demoEnabled);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!demoEnabled) return;
    let stopped = false;
    let running = false;
    async function refresh() {
      if (running) return;
      running = true;
      try {
        await refreshManagement();
        if (!stopped) { setReady(true); setError(""); }
      } catch (problem) {
        if (!stopped) setError(problem instanceof Error ? problem.message : "Could not sync shared demo data.");
      } finally { running = false; }
    }
    void refresh();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 1000);
    const onFocus = () => { void refresh(); };
    window.addEventListener("focus", onFocus);
    window.addEventListener("nexus-credential-changed", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => { stopped = true; clearInterval(timer); window.removeEventListener("focus", onFocus); window.removeEventListener("nexus-credential-changed", onFocus); document.removeEventListener("visibilitychange", onFocus); };
  }, []);
  return <>{error && <p role="status" className="bg-amber-50 p-3 text-sm text-amber-900">{error} Retrying automatically…</p>}{ready ? children : <main className="p-6" aria-busy="true">Loading shared demo data…</main>}</>;
}
