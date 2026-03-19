"use client";

interface FiltersProps {
  dateFrom: string;
  dateTo: string;
  sentiment: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onSentimentChange: (v: string) => void;
  onIngest: () => void;
  isIngesting?: boolean;
}

export function Filters({
  dateFrom,
  dateTo,
  sentiment,
  onDateFromChange,
  onDateToChange,
  onSentimentChange,
  onIngest,
  isIngesting,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border border-slate-700 bg-slate-900/50">
      <div className="flex items-center gap-2">
        <label className="text-slate-400 text-sm">From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-slate-400 text-sm">To</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-slate-400 text-sm">Sentiment</label>
        <select
          value={sentiment}
          onChange={(e) => onSentimentChange(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="">All</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
      </div>
      <button
        onClick={onIngest}
        disabled={isIngesting}
        className="ml-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isIngesting ? "Ingesting…" : "Fetch New Content"}
      </button>
    </div>
  );
}
