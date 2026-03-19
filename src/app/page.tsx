"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { SentimentChart } from "@/components/dashboard/SentimentChart";
import { TopicChart } from "@/components/dashboard/TopicChart";
import { ArticleTable } from "@/components/articles/ArticleTable";
import { Filters } from "@/components/dashboard/Filters";
import { format, subDays } from "date-fns";

function getDefaultDates() {
  const to = new Date();
  const from = subDays(to, 30);
  return {
    from: format(from, "yyyy-MM-dd"),
    to: format(to, "yyyy-MM-dd"),
  };
}

export default function DashboardPage() {
  const { from: defaultFrom, to: defaultTo } = getDefaultDates();
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState(defaultTo);
  const [sentiment, setSentiment] = useState("");
  const [stats, setStats] = useState<{
    total: number;
    sentimentDistribution: Record<string, number>;
    sentimentOverTime: Array<{ date: string; positive: number; neutral: number; negative: number }>;
    topicDistribution: Array<{ topic: string; count: number }>;
  } | null>(null);
  const [articles, setArticles] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    if (sentiment) params.set("sentiment", sentiment);

    try {
      // Ensure built-in sources exist on first load
      await fetch("/api/init");
      const [statsRes, articlesRes] = await Promise.all([
        fetch(`/api/stats?${params}`),
        fetch(`/api/articles?${params}&limit=10`),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (articlesRes.ok) {
        const data = await articlesRes.json();
        setArticles(data.articles ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, sentiment]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleIngest = async () => {
    setIngesting(true);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useMock: true }),
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIngesting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

        <Filters
          dateFrom={dateFrom}
          dateTo={dateTo}
          sentiment={sentiment}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onSentimentChange={setSentiment}
          onIngest={handleIngest}
          isIngesting={ingesting}
        />

        {loading ? (
          <div className="mt-8 flex items-center gap-3 text-slate-400">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-500" />
            Loading…
          </div>
        ) : (stats?.total ?? 0) === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-700/80 bg-slate-800/30 backdrop-blur-sm p-12 text-center">
            <p className="text-slate-200 text-lg mb-2">No content yet</p>
            <p className="text-slate-500 text-sm mb-8">Click &quot;Fetch New Content&quot; to load articles from FAO, Ethiopia Insight, and other sources.</p>
            <button
              onClick={handleIngest}
              disabled={ingesting}
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-50 shadow-lg shadow-emerald-900/20 transition-colors"
            >
              {ingesting ? "Fetching…" : "Fetch New Content"}
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8">
              <SummaryCards
                total={stats?.total ?? 0}
                sentimentDistribution={stats?.sentimentDistribution ?? {}}
              />
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SentimentChart data={stats?.sentimentOverTime ?? []} />
              <TopicChart data={stats?.topicDistribution ?? []} />
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Articles</h2>
              <ArticleTable articles={articles as Parameters<typeof ArticleTable>[0]["articles"]} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
