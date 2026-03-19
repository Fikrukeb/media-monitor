"use client";

interface SummaryCardsProps {
  total: number;
  sentimentDistribution: Record<string, number>;
}

export function SummaryCards({ total, sentimentDistribution }: SummaryCardsProps) {
  const positive = sentimentDistribution.positive ?? 0;
  const neutral = sentimentDistribution.neutral ?? 0;
  const negative = sentimentDistribution.negative ?? 0;

  const cards = [
    {
      label: "Total Articles",
      value: total,
      icon: "📰",
      color: "border-slate-600 bg-slate-800/50",
    },
    {
      label: "Positive",
      value: positive,
      icon: "😊",
      color: "border-emerald-500/50 bg-emerald-950/30",
    },
    {
      label: "Neutral",
      value: neutral,
      icon: "😐",
      color: "border-amber-500/50 bg-amber-950/30",
    },
    {
      label: "Negative",
      value: negative,
      icon: "😟",
      color: "border-rose-500/50 bg-rose-950/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border p-6 ${card.color}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">{card.label}</span>
            <span className="text-2xl">{card.icon}</span>
          </div>
          <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
