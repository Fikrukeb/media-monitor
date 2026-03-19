/**
 * POST /api/ingest - Fetch new content, analyze sentiment, and store in DB
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAllArticles } from "@/lib/ingestion/fetcher";
import { analyzeSentiment } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { useMock?: boolean };
    const useMock = body.useMock ?? true;

    // Fetch raw articles
    const rawArticles = await fetchAllArticles(useMock);

    const results = { processed: 0, skipped: 0, errors: 0 };

    for (const raw of rawArticles) {
      try {
        // Check if already exists
        const existing = await prisma.article.findUnique({
          where: { url: raw.url },
        });
        if (existing) {
          results.skipped++;
          continue;
        }

        // Use sourceId if provided (from DB sources), else find/create by name+type
        let sourceId: string;
        if (raw.sourceId) {
          sourceId = raw.sourceId;
        } else {
          let source = await prisma.source.findFirst({
            where: { name: raw.sourceName, type: raw.sourceType },
          });
          if (!source) {
            source = await prisma.source.create({
              data: { name: raw.sourceName, type: raw.sourceType, url: null },
            });
          }
          sourceId = source.id;
        }

        // Analyze sentiment (skip if no API key)
        let sentiment = "neutral";
        let sentimentScore = 0.5;
        let sentimentReason: string | null = null;
        let summary: string | null = null;
        let keyTopics: string[] = [];
        let entities: Record<string, string[]> = {};

        if (process.env.OPENAI_API_KEY) {
          try {
            const analysis = await analyzeSentiment(
              `${raw.title}\n\n${raw.content.slice(0, 3000)}`
            );
            sentiment = analysis.sentiment;
            sentimentScore = analysis.sentimentScore;
            sentimentReason = analysis.sentimentReason ?? null;
            summary = analysis.summary;
            keyTopics = analysis.keyTopics ?? [];
            entities = analysis.entities ?? {};
          } catch (err) {
            console.warn("OpenAI analysis failed for article:", raw.title, err);
          }
        }

        await prisma.article.create({
          data: {
            title: raw.title,
            content: raw.content,
            summary,
            sourceId,
            url: raw.url,
            publishedAt: raw.publishedAt,
            sentiment,
            sentimentScore,
            sentimentReason,
            tags: JSON.stringify(keyTopics),
            keyTopics: JSON.stringify(keyTopics),
            entities: JSON.stringify(entities),
          },
        });

        results.processed++;
      } catch (err) {
        console.error("Failed to process article:", raw.title, err);
        results.errors++;
      }
    }

    return NextResponse.json({
      message: "Ingestion complete",
      fetched: rawArticles.length,
      ...results,
    });
  } catch (error) {
    console.error("Ingest API error:", error);
    return NextResponse.json(
      { error: "Ingestion failed" },
      { status: 500 }
    );
  }
}
