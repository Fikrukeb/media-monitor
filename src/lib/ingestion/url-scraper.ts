/**
 * Generic URL fetcher - extracts content from web pages
 * Uses simple fetch + HTML parsing (no headless browser for simplicity)
 */
import { matchesAgricultureKeywords } from "./keywords";
import type { RawArticle } from "./sources";

/**
 * Fetch a URL and extract article-like content from HTML
 * Looks for common meta tags: og:title, og:description, article:content
 * Falls back to title + first paragraph
 */
export async function fetchFromUrl(
  pageUrl: string,
  sourceName: string,
  sourceType: string
): Promise<RawArticle[]> {
  try {
    const res = await fetch(pageUrl, {
      headers: {
        "User-Agent": "AgriMonitor/1.0 (Ethiopian Agriculture Media Monitoring)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return [];

    const html = await res.text();

    // Extract title from <title> or og:title
    const titleMatch =
      html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i) ??
      html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "Untitled";

    // Extract description from og:description or meta description
    const descMatch =
      html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i) ??
      html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
    const description = descMatch ? descMatch[1].trim() : "";

    // Extract main content - try article body or first paragraph
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    let content = articleMatch ? stripHtml(articleMatch[1]).slice(0, 5000) : "";

    if (!content) {
      const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      content = pMatch ? stripHtml(pMatch[1]).slice(0, 3000) : description;
    }

    const text = `${title} ${description} ${content}`;
    // User-registered URLs: include if we have meaningful content (user chose this source)
    if (text.length < 50) return [];
    if (!matchesAgricultureKeywords(text) && text.length < 200) return [];

    return [
      {
        title,
        content: content || description || title,
        url: pageUrl,
        sourceName,
        sourceType,
        publishedAt: new Date(),
      },
    ];
  } catch (error) {
    console.error("URL fetch error:", pageUrl, error);
    return [];
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
