/**
 * RSS and news sources for Ethiopian agriculture content
 * Includes real RSS feeds and Google News RSS (aggregates many publishers).
 *
 * Note: Samsung “News” on devices is a proprietary aggregator without a public RSS API;
 * Google News RSS fills a similar role here by surfacing many outlets in one place.
 */
export interface RawArticle {
  title: string;
  content: string;
  url: string;
  sourceName: string;
  sourceType: string;
  sourceId?: string; // When from DB, use this to link directly
  publishedAt: Date;
}

/** Google News RSS tuned to Ethiopia (gl / ceid) so results skew toward local and regional coverage. */
export function googleNewsRssUrl(query: string): string {
  const q = encodeURIComponent(query);
  return `https://news.google.com/rss/search?q=${q}&hl=en&gl=ET&ceid=ET:en`;
}

export type BuiltinRssFeed = {
  name: string;
  url: string;
  /**
   * default: Ethiopia- or keyword-focused outlets — keep items if ag keywords match OR text mentions Ethiopia.
   * agriculture-only: stricter — for broad aggregators (Google News) so politics/sports from the same region drop out.
   */
  filterMode?: "default" | "agriculture-only";
};

/**
 * Built-in RSS feeds ingested when not overridden by an active DB source with the same URL.
 * Mix of Ethiopian publishers and Google News topic searches (multi-outlet summaries/snippets).
 */
export const BUILTIN_RSS_FEEDS: BuiltinRssFeed[] = [
  { name: "FAO Newsroom", url: "https://www.fao.org/feeds/fao-newsroom-rss" },
  { name: "Ethiopia Insight", url: "https://www.ethiopia-insight.com/feed/" },
  { name: "New Business Ethiopia", url: "https://newbusinessethiopia.com/feed/" },
  { name: "Addis Fortune", url: "https://addisfortune.news/feed/" },
  { name: "Capital Ethiopia", url: "https://www.capitalethiopia.com/feed/" },
  { name: "AllAfrica — Ethiopia", url: "https://allafrica.com/ethiopia/feed/" },
  { name: "Addis Standard", url: "https://addisstandard.com/feed/" },
  { name: "Ethiopian Reporter", url: "https://www.ethiopianreporter.com/feed" },
  {
    name: "Google News — Ethiopia agriculture",
    url: googleNewsRssUrl("Ethiopia agriculture"),
    filterMode: "agriculture-only",
  },
  {
    name: "Google News — Ethiopian farmers & crops",
    url: googleNewsRssUrl("Ethiopian farmers OR Ethiopia farming OR Ethiopia crops"),
    filterMode: "agriculture-only",
  },
  {
    name: "Google News — Ethiopia food security & livestock",
    url: googleNewsRssUrl("Ethiopia food security OR Ethiopia livestock OR Ethiopia drought farmers"),
    filterMode: "agriculture-only",
  },
];

export type BuiltinDbSource = {
  name: string;
  type: string;
  url: string | null;
  metadata: string | null;
  isBuiltIn: boolean;
};

/** Sources created by /api/init and prisma seed (RSS + global social placeholders). */
export function getBuiltinDbSources(): BuiltinDbSource[] {
  const rss: BuiltinDbSource[] = BUILTIN_RSS_FEEDS.map((f) => ({
    name: f.name,
    type: "rss",
    url: f.url,
    metadata: null,
    isBuiltIn: true,
  }));
  const social: BuiltinDbSource[] = [
    { name: "Twitter/X", type: "twitter", url: null, metadata: null, isBuiltIn: true },
    { name: "Facebook", type: "facebook", url: null, metadata: null, isBuiltIn: true },
  ];
  return [...rss, ...social];
}
