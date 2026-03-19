"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface Source {
  id: string;
  name: string;
  type: string;
  url: string | null;
  metadata: string | null;
  isActive: boolean;
  isBuiltIn: boolean;
  _count?: { articles: number };
}

const SOURCE_TYPES = [
  { value: "rss", label: "RSS Feed", icon: "📡", needsUrl: true, needsMeta: false },
  { value: "twitter", label: "Twitter/X", icon: "𝕏", needsUrl: false, needsMeta: true, metaLabel: "Handle (e.g. @username)" },
  { value: "facebook", label: "Facebook", icon: "📘", needsUrl: false, needsMeta: true, metaLabel: "Page ID or Page URL" },
  { value: "url", label: "Website URL", icon: "🌐", needsUrl: true, needsMeta: false },
];

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "rss",
    url: "",
    metadata: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchSources = async () => {
    // Ensure built-in sources exist
    await fetch("/api/init");
    const res = await fetch("/api/sources");
    if (res.ok) setSources(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const typeConfig = SOURCE_TYPES.find((t) => t.value === form.type);
    const metadata: Record<string, string> = {};

    if (typeConfig?.needsMeta && form.metadata) {
      if (form.type === "twitter") {
        metadata.handle = form.metadata.replace(/^@/, "").trim();
      } else if (form.type === "facebook") {
        if (form.metadata.includes("facebook.com") || form.metadata.includes("fb.com")) {
          metadata.pageUrl = form.metadata.trim();
        } else {
          metadata.pageId = form.metadata.trim();
        }
      }
    }

    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
          url: form.url.trim() || undefined,
          metadata: Object.keys(metadata).length ? metadata : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to add source");
        return;
      }

      setForm({ name: "", type: "rss", url: "", metadata: "" });
      setShowForm(false);
      fetchSources();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (source: Source) => {
    const res = await fetch(`/api/sources/${source.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !source.isActive }),
    });
    if (res.ok) fetchSources();
  };

  const handleDelete = async (source: Source) => {
    if (source.isBuiltIn) return;
    if (!confirm(`Delete "${source.name}"?`)) return;
    const res = await fetch(`/api/sources/${source.id}`, { method: "DELETE" });
    if (res.ok) fetchSources();
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Sources</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-50"
          >
            {showForm ? "Cancel" : "+ Add Source"}
          </button>
        </div>

        <p className="text-slate-400 text-sm mb-6">
          Register RSS feeds, Twitter/X handles, Facebook pages, or website URLs to monitor.
          Add TWITTER_BEARER_TOKEN and FACEBOOK_ACCESS_TOKEN in .env for live social data.
        </p>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Add New Source</h2>
            {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. AllAfrica Ethiopia"
                  required
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                >
                  {SOURCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {SOURCE_TYPES.find((t) => t.value === form.type)?.needsUrl && (
              <div className="mt-4">
                <label className="block text-slate-400 text-sm mb-1">URL</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://example.com/feed.xml"
                  required={SOURCE_TYPES.find((t) => t.value === form.type)?.needsUrl}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {SOURCE_TYPES.find((t) => t.value === form.type)?.needsMeta && (
              <div className="mt-4">
                <label className="block text-slate-400 text-sm mb-1">
                  {SOURCE_TYPES.find((t) => t.value === form.type)?.metaLabel}
                </label>
                <input
                  type="text"
                  value={form.metadata}
                  onChange={(e) => setForm((f) => ({ ...f, metadata: e.target.value }))}
                  placeholder={
                    form.type === "twitter"
                      ? "@username or username"
                      : "Page ID or https://facebook.com/PageName"
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-50"
              >
                {saving ? "Adding…" : "Add Source"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-slate-400">Loading…</div>
        ) : (
          <div className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/50">
                  <th className="text-left py-4 px-4 text-slate-300 font-medium">Name</th>
                  <th className="text-left py-4 px-4 text-slate-300 font-medium">Type</th>
                  <th className="text-left py-4 px-4 text-slate-300 font-medium">URL / Config</th>
                  <th className="text-left py-4 px-4 text-slate-300 font-medium">Articles</th>
                  <th className="text-left py-4 px-4 text-slate-300 font-medium">Status</th>
                  <th className="text-left py-4 px-4 text-slate-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                    <td className="py-4 px-4 text-white font-medium">{source.name}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-700 px-2 py-1 text-xs text-slate-300">
                        {SOURCE_TYPES.find((t) => t.value === source.type)?.icon ?? "📄"}{" "}
                        {source.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-sm max-w-xs truncate">
                      {source.url ??
                        (source.metadata
                          ? (() => {
                              try {
                                const m = JSON.parse(source.metadata) as Record<string, string>;
                                return m.handle ?? m.pageId ?? m.pageUrl ?? "—";
                              } catch {
                                return "—";
                              }
                            })()
                          : "—")}
                    </td>
                    <td className="py-4 px-4 text-slate-400">{source._count?.articles ?? 0}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleActive(source)}
                        className={`rounded-md px-2 py-1 text-xs font-medium ${
                          source.isActive
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {source.isActive ? "Active" : "Paused"}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      {!source.isBuiltIn && (
                        <button
                          onClick={() => handleDelete(source)}
                          className="text-rose-400 hover:text-rose-300 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sources.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                No sources yet. Add RSS feeds, Twitter handles, Facebook pages, or URLs above.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
