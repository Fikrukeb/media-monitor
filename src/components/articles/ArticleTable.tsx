"use client";

import { format } from "date-fns";

interface Article {
  id: string;
  title: string;
  url: string;
  source: { name: string };
  sentiment: string;
  publishedAt: string;
}

interface ArticleTableProps {
  articles: Article[];
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const styles: Record<string, string> = {
    positive: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
    neutral: "bg-amber-500/20 text-amber-400 border-amber-500/50",
    negative: "bg-rose-500/20 text-rose-400 border-rose-500/50",
  };
  const style = styles[sentiment] ?? styles.neutral;

  return (
    <span
      className={`inline-flex px-2 py-1 rounded-md text-xs font-medium border capitalize ${style}`}
    >
      {sentiment}
    </span>
  );
}

export function ArticleTable({ articles }: ArticleTableProps) {
  if (articles.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-12 text-center text-slate-400">
        No articles found. Run ingestion to fetch content.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              <th className="text-left py-4 px-4 text-slate-300 font-medium">Title</th>
              <th className="text-left py-4 px-4 text-slate-300 font-medium">Source</th>
              <th className="text-left py-4 px-4 text-slate-300 font-medium">Sentiment</th>
              <th className="text-left py-4 px-4 text-slate-300 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr
                key={article.id}
                className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-4 px-4">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline line-clamp-2 max-w-md"
                  >
                    {article.title}
                  </a>
                </td>
                <td className="py-4 px-4 text-slate-300">{article.source.name}</td>
                <td className="py-4 px-4">
                  <SentimentBadge sentiment={article.sentiment} />
                </td>
                <td className="py-4 px-4 text-slate-400 text-sm">
                  {format(new Date(article.publishedAt), "MMM d, yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
