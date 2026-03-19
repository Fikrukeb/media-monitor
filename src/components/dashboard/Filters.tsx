"use client";

import { DatePicker } from "@/components/ui/date-picker";

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
    <div className="flex flex-wrap items-center gap-4 p-5 rounded-xl border border-slate-700/80 bg-slate-800/30 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <label className="text-slate-400 text-sm">From</label>
        <DatePicker
          value={dateFrom}
          onChange={onDateFromChange}
          placeholder="Start date"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-slate-400 text-sm">To</label>
        <DatePicker
          value={dateTo}
          onChange={onDateToChange}
          placeholder="End date"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-slate-400 text-sm">Sentiment</label>
        <select
          value={sentiment}
          onChange={(e) => onSentimentChange(e.target.value)}
          className="rounded-xl border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-colors"
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
        className="ml-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-900/20"
      >
        {isIngesting ? "Ingesting…" : "Fetch New Content"}
      </button>
    </div>
  );
}
