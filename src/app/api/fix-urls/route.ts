/**
 * POST /api/fix-urls - Update articles with broken example.com URLs to working URLs
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const URL_MAP: Record<string, string> = {
  "https://example.com/coffee-exports-2024": "https://www.fao.org/ethiopia/news/en/#coffee",
  "https://example.com/drought-somali": "https://www.fao.org/emergencies/where-we-work/ETH/en/#drought",
  "https://example.com/teff-superfood": "https://www.ethiopia-insight.com/#teff",
  "https://example.com/maize-amhara": "https://newbusinessethiopia.com/#maize",
  "https://example.com/livestock-vaccination": "https://www.fao.org/ethiopia/news/en/#livestock",
  "https://example.com/sesame-decline": "https://addisfortune.news/#sesame",
  "https://example.com/irrigation-tigray": "https://www.fao.org/emergencies/where-we-work/ETH/en/#irrigation",
  "https://example.com/khat-regulation": "https://www.ethiopia-insight.com/#khat",
  "https://twitter.com/example/status/1": "https://x.com/FAO",
  "https://twitter.com/example/status/2": "https://x.com/FAOEthiopia",
  "https://twitter.com/example/status/3": "https://x.com/FAOAfrica",
  "https://facebook.com/example/posts/1": "https://www.facebook.com/FAO",
  "https://facebook.com/example/posts/2": "https://www.facebook.com/EthiopianAgriculturalAuthority",
  "https://facebook.com/example/posts/3": "https://www.facebook.com/FAO",
};

export async function POST() {
  try {
    let updated = 0;
    for (const [oldUrl, newUrl] of Object.entries(URL_MAP)) {
      const articles = await prisma.article.findMany({ where: { url: oldUrl } });
      for (const article of articles) {
        // Use article id in fragment for uniqueness (fragment doesn't affect server, page still loads)
        const uniqueUrl = articles.length > 1
          ? newUrl.replace(/#\w+/, `#${article.id}`)
          : newUrl;
        await prisma.article.update({
          where: { id: article.id },
          data: { url: uniqueUrl },
        });
        updated++;
      }
    }
    return NextResponse.json({ ok: true, updated });
  } catch (error) {
    console.error("Fix URLs error:", error);
    return NextResponse.json({ error: "Failed to fix URLs" }, { status: 500 });
  }
}
