/**
 * Data ingestion service - fetches from RSS, Twitter, Facebook, URLs, and user-registered sources
 */
import Parser from "rss-parser";
import { prisma } from "@/lib/prisma";
import { matchesAgricultureKeywords, matchesGeneralAgricultureTerms } from "./keywords";
import { BUILTIN_RSS_FEEDS, type RawArticle } from "./sources";
import { fetchTwitter } from "./twitter";
import { fetchFacebook } from "./facebook";
import { fetchFromUrl } from "./url-scraper";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "EthiopianAgricultureMonitor/1.0",
  },
});

function resolveRssFilterMode(
  url: string,
  explicit?: "default" | "agriculture-only"
): "default" | "agriculture-only" {
  if (explicit) return explicit;
  if (url.includes("news.google.com/rss")) return "agriculture-only";
  return "default";
}

function isRssItemRelevant(text: string, mode: "default" | "agriculture-only"): boolean {
  if (mode === "agriculture-only") {
    return matchesAgricultureKeywords(text) || matchesGeneralAgricultureTerms(text);
  }
  return matchesAgricultureKeywords(text) || text.toLowerCase().includes("ethiopia");
}

async function fetchRssFeed(
  url: string,
  sourceName: string,
  sourceId?: string,
  filterMode?: "default" | "agriculture-only"
): Promise<RawArticle[]> {
  try {
    const feed = await parser.parseURL(url);
    const articles: RawArticle[] = [];
    const mode = resolveRssFilterMode(url, filterMode);

    for (const item of feed.items ?? []) {
      const title = item.title ?? "";
      const content = item.contentSnippet ?? item.content ?? item.summary ?? "";
      const text = `${title} ${content}`;

      if (isRssItemRelevant(text, mode)) {
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
 * Fetch articles from all configured sources (real RSS/API/URL only — no mock content).
 * - DB sources (user-registered RSS, Twitter, Facebook, URL)
 * - Built-in RSS (if not in DB)
 * - Twitter/X (global + per-handle) when TWITTER_BEARER_TOKEN is set
 * - Facebook (global + per-page) when FACEBOOK_ACCESS_TOKEN is set
 */
export async function fetchAllArticles(): Promise<RawArticle[]> {
  const allArticles: RawArticle[] = [];

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
      const articles = await fetchTwitter(meta.handle);
      articles.forEach((a) => {
        allArticles.push({ ...a, sourceName: source.name, sourceId: source.id });
      });
    } else if (source.type === "facebook") {
      const meta = source.metadata
        ? (JSON.parse(source.metadata) as { pageId?: string; pageUrl?: string })
        : {};
      const articles = await fetchFacebook(meta.pageId, meta.pageUrl);
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
  const dbRssUrls = new Set(
    dbSources.filter((s) => s.type === "rss" && s.url).map((s) => s.url as string)
  );
  for (const feed of BUILTIN_RSS_FEEDS) {
    if (!dbRssUrls.has(feed.url)) {
      const articles = await fetchRssFeed(feed.url, feed.name, undefined, feed.filterMode);
      allArticles.push(...articles);
    }
  }

  // 3. Global Twitter/X (if no twitter source in DB)
  const hasTwitterSource = dbSources.some((s) => s.type === "twitter");
  if (!hasTwitterSource) {
    const articles = await fetchTwitter(undefined);
    allArticles.push(...articles);
  }

  // 4. Global Facebook (if no facebook source in DB)
  const hasFacebookSource = dbSources.some((s) => s.type === "facebook");
  if (!hasFacebookSource) {
    const articles = await fetchFacebook(undefined, undefined);
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
