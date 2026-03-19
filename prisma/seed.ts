/**
 * Seed script - creates default built-in sources
 * Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BUILTIN_SOURCES = [
  { name: "FAO Newsroom", type: "rss", url: "https://www.fao.org/feeds/fao-newsroom-rss", isBuiltIn: true },
  { name: "Ethiopia Insight", type: "rss", url: "https://www.ethiopia-insight.com/feed/", isBuiltIn: true },
  { name: "New Business Ethiopia", type: "rss", url: "https://newbusinessethiopia.com/feed/", isBuiltIn: true },
  { name: "Addis Fortune", type: "rss", url: "https://addisfortune.news/feed/", isBuiltIn: true },
  { name: "Capital Ethiopia", type: "rss", url: "https://www.capitalethiopia.com/feed/", isBuiltIn: true },
  { name: "Twitter/X", type: "twitter", url: null, metadata: null, isBuiltIn: true },
  { name: "Facebook", type: "facebook", url: null, metadata: null, isBuiltIn: true },
];

async function main() {
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
  console.log("Seed complete. Built-in sources ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
