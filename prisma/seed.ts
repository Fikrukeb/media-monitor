/**
 * Seed script - creates default built-in sources
 * Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { getBuiltinDbSources } from "../src/lib/ingestion/sources";

const prisma = new PrismaClient();

async function main() {
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
  console.log("Seed complete. Built-in sources ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
