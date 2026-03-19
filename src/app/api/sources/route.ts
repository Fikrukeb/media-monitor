/**
 * GET /api/sources - List all sources
 * POST /api/sources - Create new source (user-registered)
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sources = await prisma.source.findMany({
      orderBy: [{ isBuiltIn: "desc" }, { name: "asc" }],
      include: { _count: { select: { articles: true } } },
    });
    return NextResponse.json(sources);
  } catch (error) {
    console.error("Sources GET error:", error);
    return NextResponse.json({ error: "Failed to fetch sources" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, url, metadata } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Missing required fields: name, type" },
        { status: 400 }
      );
    }

    const validTypes = ["rss", "twitter", "facebook", "url"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    if ((type === "rss" || type === "url") && !url) {
      return NextResponse.json(
        { error: "URL is required for rss and url sources" },
        { status: 400 }
      );
    }

    if (type === "twitter" && !metadata?.handle) {
      return NextResponse.json(
        { error: "metadata.handle is required for Twitter sources" },
        { status: 400 }
      );
    }

    if (type === "facebook" && !metadata?.pageId && !metadata?.pageUrl) {
      return NextResponse.json(
        { error: "metadata.pageId or metadata.pageUrl is required for Facebook sources" },
        { status: 400 }
      );
    }

    const source = await prisma.source.create({
      data: {
        name,
        type,
        url: url ?? null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        isBuiltIn: false,
      },
    });

    return NextResponse.json(source);
  } catch (error) {
    console.error("Sources POST error:", error);
    return NextResponse.json({ error: "Failed to create source" }, { status: 500 });
  }
}
