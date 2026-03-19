"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function SettingsPage() {
  const [fixing, setFixing] = useState(false);
  const [fixResult, setFixResult] = useState<string | null>(null);

  const handleFixUrls = async () => {
    setFixing(true);
    setFixResult(null);
    try {
      const res = await fetch("/api/fix-urls", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setFixResult(`Updated ${data.updated} article links.`);
      } else {
        setFixResult("Failed to fix links.");
      }
    } catch {
      setFixResult("Failed to fix links.");
    } finally {
      setFixing(false);
    }
  };
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

        <div className="space-y-8 max-w-2xl">
          <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Fix Broken Links</h2>
            <p className="text-slate-300 text-sm mb-4">
              Articles with example.com URLs lead to dead links. Fix them to point to real Ethiopian agriculture news sites.
            </p>
            <button
              onClick={handleFixUrls}
              disabled={fixing}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium disabled:opacity-50"
            >
              {fixing ? "Fixing…" : "Fix Broken Links"}
            </button>
            {fixResult && <p className="mt-2 text-slate-400 text-sm">{fixResult}</p>}
          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Data Sources</h2>
            <p className="text-slate-300 text-sm mb-4">
              Built-in sources are auto-configured on first load (FAO, Ethiopia Insight, New Business Ethiopia,
              Addis Fortune, Capital Ethiopia, Twitter/X, Facebook). Go to <strong>Sources</strong> to add more.
              Mock agriculture content is always included when external feeds fail.
            </p>
            <p className="text-slate-400 text-sm">
              Click &quot;Fetch New Content&quot; on the Dashboard to ingest. Keywords: Ethiopian agriculture,
              farming, coffee, teff, maize, livestock, etc.
            </p>
          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">API Endpoints</h2>
            <ul className="space-y-2 text-slate-300 text-sm font-mono">
              <li>POST /api/ingest — Fetch and analyze new content</li>
              <li>GET /api/articles — List articles (filters: sentiment, from, to, search)</li>
              <li>POST /api/analyze — Analyze text sentiment (body: {"{ text }"})</li>
              <li>GET /api/stats — Dashboard statistics</li>
            </ul>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
