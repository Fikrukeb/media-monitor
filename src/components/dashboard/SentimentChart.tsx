"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

interface SentimentChartProps {
  data: DataPoint[];
}

export function SentimentChart({ data }: SentimentChartProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 h-80">
      <h3 className="text-lg font-semibold text-white mb-4">Sentiment Over Time</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#e2e8f0" }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="positive"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981" }}
            name="Positive"
          />
          <Line
            type="monotone"
            dataKey="neutral"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: "#f59e0b" }}
            name="Neutral"
          />
          <Line
            type="monotone"
            dataKey="negative"
            stroke="#f43f5e"
            strokeWidth={2}
            dot={{ fill: "#f43f5e" }}
            name="Negative"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
