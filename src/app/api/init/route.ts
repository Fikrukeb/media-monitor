/**
 * GET /api/init - Ensure built-in sources exist (call on first load)
 * Seeds default sources if database is empty
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBuiltinDbSources } from "@/lib/ingestion/sources";

export async function GET() {
  try {
    // Always ensure built-in sources exist (idempotent)
    for (const s of getBuiltinDbSources()) {
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
