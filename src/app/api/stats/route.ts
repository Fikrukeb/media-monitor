/**
 * GET /api/stats - Dashboard statistics for summary cards and charts
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter: Record<string, unknown> = {};
    if (from || to) {
      dateFilter.publishedAt = {};
      if (from) (dateFilter.publishedAt as Record<string, Date>).gte = new Date(from);
      if (to) (dateFilter.publishedAt as Record<string, Date>).lte = new Date(to);
    }

    const [total, sentimentCounts, byDate, byTopic] = await Promise.all([
      prisma.article.count({ where: dateFilter }),
      prisma.article.groupBy({
        by: ["sentiment"],
        where: dateFilter,
        _count: true,
      }),
      prisma.article.findMany({
        where: dateFilter,
        select: { publishedAt: true, sentiment: true },
      }),
      getTopicDistribution(dateFilter),
    ]);

    const sentimentDistribution = Object.fromEntries(
      sentimentCounts.map((s) => [s.sentiment, s._count])
    );

    // Sentiment over time (group by date)
    const sentimentByDate: Record<string, { positive: number; neutral: number; negative: number }> = {};
    for (const a of byDate) {
      const d = a.publishedAt.toISOString().slice(0, 10);
      if (!sentimentByDate[d]) sentimentByDate[d] = { positive: 0, neutral: 0, negative: 0 };
      sentimentByDate[d][a.sentiment as "positive" | "neutral" | "negative"]++;
    }

    const sentimentOverTime = Object.entries(sentimentByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({ date, ...counts }));

    return NextResponse.json({
      total,
      sentimentDistribution,
      sentimentOverTime,
      topicDistribution: byTopic,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

async function getTopicDistribution(dateFilter: Record<string, unknown>) {
  const articles = await prisma.article.findMany({
    where: dateFilter,
    select: { keyTopics: true },
  });

  const counts: Record<string, number> = {};
  for (const a of articles) {
    if (!a.keyTopics) continue;
    try {
      const topics = JSON.parse(a.keyTopics) as string[];
      for (const t of topics) {
        const key = t.trim();
        if (key) counts[key] = (counts[key] ?? 0) + 1;
      }
    } catch {
      // ignore
    }
  }

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([topic, count]) => ({ topic, count }));
}
