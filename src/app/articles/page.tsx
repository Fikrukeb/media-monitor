"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ArticleTable } from "@/components/articles/ArticleTable";
import { Pagination } from "@/components/articles/Pagination";
import { DatePicker } from "@/components/ui/date-picker";
import { format, subDays } from "date-fns";

const PAGE_SIZE = 20;

function getDefaultDates() {
  const to = new Date();
  const from = subDays(to, 90);
  return {
    from: format(from, "yyyy-MM-dd"),
    to: format(to, "yyyy-MM-dd"),
  };
}

export default function ArticlesPage() {
  const { from: defaultFrom, to: defaultTo } = getDefaultDates();
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState(defaultTo);
  const [sentiment, setSentiment] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<unknown[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    if (sentiment) params.set("sentiment", sentiment);
    if (search) params.set("search", search);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String((page - 1) * PAGE_SIZE));

    try {
      const res = await fetch(`/api/articles?${params}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles ?? []);
        setTotal(data.total ?? 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, sentiment, search, page]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const resetPageAndFetch = useCallback((updater: () => void) => {
    updater();
    setPage(1);
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Articles</h1>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <a
            href={`/api/articles/export?${new URLSearchParams({
              ...(dateFrom && { from: dateFrom }),
              ...(dateTo && { to: dateTo }),
              ...(sentiment && { sentiment }),
            }).toString()}`}
            className="px-4 py-2 rounded-lg border border-slate-600 hover:border-emerald-500 text-slate-300 hover:text-emerald-400 text-sm font-medium transition-colors"
          >
            Export CSV
          </a>
          <DatePicker
            value={dateFrom}
            onChange={(v) => resetPageAndFetch(() => setDateFrom(v))}
            placeholder="From date"
          />
          <DatePicker
            value={dateTo}
            onChange={(v) => resetPageAndFetch(() => setDateTo(v))}
            placeholder="To date"
          />
          <select
            value={sentiment}
            onChange={(e) => resetPageAndFetch(() => setSentiment(e.target.value))}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
          <input
            type="search"
            placeholder="Search articles…"
            value={search}
            onChange={(e) => resetPageAndFetch(() => setSearch(e.target.value))}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none min-w-[200px]"
          />
        </div>

        {loading ? (
          <div className="text-slate-400">Loading…</div>
        ) : (
          <>
            <p className="text-slate-400 text-sm mb-4">{total} articles (20 per page)</p>
            <ArticleTable articles={articles as Parameters<typeof ArticleTable>[0]["articles"]} />
            <Pagination
              page={page}
              totalItems={total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
