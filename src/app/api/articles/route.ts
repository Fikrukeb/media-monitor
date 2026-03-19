/**
 * GET /api/articles - List articles with optional filters
 * POST /api/articles - Create article (used by ingestion)
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sentiment = searchParams.get("sentiment");
    const sourceId = searchParams.get("sourceId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const search = searchParams.get("search");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const where: Record<string, unknown> = {};

    if (sentiment) {
      where.sentiment = sentiment;
    }
    if (sourceId) {
      where.sourceId = sourceId;
    }
    if (from || to) {
      where.publishedAt = {};
      if (from) (where.publishedAt as Record<string, Date>).gte = new Date(from);
      if (to) (where.publishedAt as Record<string, Date>).lte = new Date(to);
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { summary: { contains: search } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: { source: true },
        orderBy: { publishedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({ articles, total });
  } catch (error) {
    console.error("Articles GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      summary,
      sourceId,
      url,
      publishedAt,
      sentiment,
      sentimentScore,
      sentimentReason,
      tags,
      keyTopics,
      entities,
    } = body;

    if (!title || !content || !sourceId || !url || !publishedAt || !sentiment) {
      return NextResponse.json(
        { error: "Missing required fields: title, content, sourceId, url, publishedAt, sentiment" },
        { status: 400 }
      );
    }

    const article = await prisma.article.upsert({
      where: { url },
      create: {
        title,
        content,
        summary: summary ?? null,
        sourceId,
        url,
        publishedAt: new Date(publishedAt),
        sentiment,
        sentimentScore: Number(sentimentScore) ?? 0.5,
        sentimentReason: sentimentReason ?? null,
        tags: tags ?? "[]",
        keyTopics: keyTopics ? JSON.stringify(keyTopics) : null,
        entities: entities ? JSON.stringify(entities) : null,
      },
      update: {
        title,
        content,
        summary: summary ?? null,
        sentiment,
        sentimentScore: Number(sentimentScore) ?? 0.5,
        sentimentReason: sentimentReason ?? null,
        tags: tags ?? "[]",
        keyTopics: keyTopics ? JSON.stringify(keyTopics) : null,
        entities: entities ? JSON.stringify(entities) : null,
      },
      include: { source: true },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("Articles POST error:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
