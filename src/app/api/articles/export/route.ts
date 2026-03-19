/**
 * GET /api/articles/export - Export articles as CSV
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sentiment = searchParams.get("sentiment");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = {};
    if (sentiment) where.sentiment = sentiment;
    if (from || to) {
      where.publishedAt = {};
      if (from) (where.publishedAt as Record<string, Date>).gte = new Date(from);
      if (to) (where.publishedAt as Record<string, Date>).lte = new Date(to);
    }

    const articles = await prisma.article.findMany({
      where,
      include: { source: true },
      orderBy: { publishedAt: "desc" },
      take: 1000,
    });

    const headers = ["Title", "Source", "URL", "Sentiment", "Score", "Published"];
    const rows = articles.map((a) => [
      `"${(a.title ?? "").replace(/"/g, '""')}"`,
      `"${(a.source?.name ?? "").replace(/"/g, '""')}"`,
      a.url,
      a.sentiment,
      a.sentimentScore,
      format(new Date(a.publishedAt), "yyyy-MM-dd"),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="articles-${format(new Date(), "yyyy-MM-dd")}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
