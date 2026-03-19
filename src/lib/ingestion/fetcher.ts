/**
 * Data ingestion service - fetches from RSS, Twitter, Facebook, URLs, and user-registered sources
 */
import Parser from "rss-parser";
import { prisma } from "@/lib/prisma";
import { matchesAgricultureKeywords } from "./keywords";
import { MOCK_ARTICLES, type RawArticle } from "./sources";
import { fetchTwitter } from "./twitter";
import { fetchFacebook } from "./facebook";
import { fetchFromUrl } from "./url-scraper";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "EthiopianAgricultureMonitor/1.0",
  },
});

// Built-in RSS feeds - use working feeds (many Ethiopia sites block bots or have broken feeds)
const BUILTIN_RSS = [
  { name: "FAO Newsroom", url: "https://www.fao.org/feeds/fao-newsroom-rss", type: "rss" },
  { name: "Ethiopia Insight", url: "https://www.ethiopia-insight.com/feed/", type: "rss" },
  { name: "New Business Ethiopia", url: "https://newbusinessethiopia.com/feed/", type: "rss" },
  { name: "Addis Fortune", url: "https://addisfortune.news/feed/", type: "rss" },
  { name: "Capital Ethiopia", url: "https://www.capitalethiopia.com/feed/", type: "rss" },
];

async function fetchRssFeed(
  url: string,
  sourceName: string,
  sourceId?: string
): Promise<RawArticle[]> {
  try {
    const feed = await parser.parseURL(url);
    const articles: RawArticle[] = [];

    for (const item of feed.items ?? []) {
      const title = item.title ?? "";
      const content = item.contentSnippet ?? item.content ?? item.summary ?? "";
      const text = `${title} ${content}`;

      // FAO/global feeds: include if agriculture-related; Ethiopia feeds: include all (filter later)
      const isRelevant = matchesAgricultureKeywords(text) || text.toLowerCase().includes("ethiopia");
      if (isRelevant) {
        articles.push({
          title,
          content: content.slice(0, 5000),
          url: item.link ?? `https://example.com/${Date.now()}`,
          sourceName,
          sourceType: "rss",
          sourceId,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        });
      }
    }

    return articles;
  } catch (error) {
    console.error(`RSS fetch failed for ${url}:`, error);
    return [];
  }
}

/**
 * Fetch articles from all configured sources
 * - Mock data FIRST (ensures content when external feeds fail)
 * - DB sources (user-registered RSS, Twitter, Facebook, URL)
 * - Built-in RSS (if not in DB)
 * - Twitter/X (global + per-handle)
 * - Facebook (global + per-page)
 */
export async function fetchAllArticles(useMockFallback = true): Promise<RawArticle[]> {
  const allArticles: RawArticle[] = [];

  // 0. Always include mock data first - ensures dashboard has content when feeds fail
  if (useMockFallback) {
    allArticles.push(...MOCK_ARTICLES);
  }

  // 1. Fetch from DB sources (user-registered)
  const dbSources = await prisma.source.findMany({
    where: { isActive: true },
  });

  for (const source of dbSources) {
    if (source.type === "rss" && source.url) {
      const articles = await fetchRssFeed(source.url, source.name, source.id);
      allArticles.push(...articles);
    } else if (source.type === "twitter") {
      const meta = source.metadata ? (JSON.parse(source.metadata) as { handle?: string }) : {};
      const articles = await fetchTwitter(meta.handle, useMockFallback);
      articles.forEach((a) => {
        allArticles.push({ ...a, sourceName: source.name, sourceId: source.id });
      });
    } else if (source.type === "facebook") {
      const meta = source.metadata
        ? (JSON.parse(source.metadata) as { pageId?: string; pageUrl?: string })
        : {};
      const articles = await fetchFacebook(meta.pageId, meta.pageUrl, useMockFallback);
      articles.forEach((a) => {
        allArticles.push({ ...a, sourceName: source.name, sourceId: source.id });
      });
    } else if (source.type === "url" && source.url) {
      const articles = await fetchFromUrl(source.url, source.name, "url");
      articles.forEach((a) => {
        allArticles.push({ ...a, sourceId: source.id });
      });
    }
  }

  // 2. Built-in RSS (if not already in DB)
  const dbRssUrls = new Set(dbSources.filter((s) => s.type === "rss").map((s) => s.url));
  for (const feed of BUILTIN_RSS) {
    if (!dbRssUrls.has(feed.url)) {
      const articles = await fetchRssFeed(feed.url, feed.name);
      allArticles.push(...articles);
    }
  }

  // 3. Global Twitter/X (if no twitter source in DB)
  const hasTwitterSource = dbSources.some((s) => s.type === "twitter");
  if (!hasTwitterSource) {
    const articles = await fetchTwitter(undefined, useMockFallback);
    allArticles.push(...articles);
  }

  // 4. Global Facebook (if no facebook source in DB)
  const hasFacebookSource = dbSources.some((s) => s.type === "facebook");
  if (!hasFacebookSource) {
    const articles = await fetchFacebook(undefined, undefined, useMockFallback);
    allArticles.push(...articles);
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  return allArticles.filter((a) => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
}
