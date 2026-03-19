/**
 * GET /api/init - Ensure built-in sources exist (call on first load)
 * Seeds default sources if database is empty
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BUILTIN_SOURCES = [
  { name: "FAO Newsroom", type: "rss", url: "https://www.fao.org/feeds/fao-newsroom-rss", isBuiltIn: true },
  { name: "Ethiopia Insight", type: "rss", url: "https://www.ethiopia-insight.com/feed/", isBuiltIn: true },
  { name: "New Business Ethiopia", type: "rss", url: "https://newbusinessethiopia.com/feed/", isBuiltIn: true },
  { name: "Addis Fortune", type: "rss", url: "https://addisfortune.news/feed/", isBuiltIn: true },
  { name: "Capital Ethiopia", type: "rss", url: "https://www.capitalethiopia.com/feed/", isBuiltIn: true },
  { name: "Twitter/X", type: "twitter", url: null, metadata: null, isBuiltIn: true },
  { name: "Facebook", type: "facebook", url: null, metadata: null, isBuiltIn: true },
];

export async function GET() {
  try {
    // Always ensure built-in sources exist (idempotent)
    for (const s of BUILTIN_SOURCES) {
      const existing = await prisma.source.findFirst({
        where: { name: s.name, type: s.type, isBuiltIn: true },
      });
      if (!existing) {
        await prisma.source.create({
          data: {
            name: s.name,
            type: s.type,
            url: s.url,
            metadata: (s as { metadata?: string }).metadata ?? null,
            isBuiltIn: true,
          },
        });
      }
    }

    const total = await prisma.source.count();
    return NextResponse.json({ ok: true, total });
  } catch (error) {
    console.error("Init API error:", error);
    return NextResponse.json({ error: "Init failed" }, { status: 500 });
  }
}
