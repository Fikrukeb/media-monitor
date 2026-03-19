"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TopicData {
  topic: string;
  count: number;
}

interface TopicChartProps {
  data: TopicData[];
}

export function TopicChart({ data }: TopicChartProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 h-80">
      <h3 className="text-lg font-semibold text-white mb-4">Topic Distribution</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="topic"
            width={100}
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} name="Articles" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
