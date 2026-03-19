/**
 * PATCH /api/sources/[id] - Update source
 * DELETE /api/sources/[id] - Delete source (user-registered only)
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, url, metadata, isActive } = body;

    const existing = await prisma.source.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (type !== undefined) data.type = type;
    if (url !== undefined) data.url = url;
    if (metadata !== undefined) data.metadata = JSON.stringify(metadata);
    if (isActive !== undefined) data.isActive = isActive;

    const source = await prisma.source.update({
      where: { id },
      data,
    });

    return NextResponse.json(source);
  } catch (error) {
    console.error("Source PATCH error:", error);
    return NextResponse.json({ error: "Failed to update source" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.source.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    if (existing.isBuiltIn) {
      return NextResponse.json(
        { error: "Built-in sources cannot be deleted" },
        { status: 403 }
      );
    }

    await prisma.source.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Source DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete source" }, { status: 500 });
  }
}
