/**
 * Facebook fetcher — uses Graph API when FACEBOOK_ACCESS_TOKEN is set.
 * Returns [] if there is no token or the request fails (no mock data).
 */
import { matchesAgricultureKeywords } from "./keywords";
import type { RawArticle } from "./sources";

export async function fetchFacebook(pageId?: string, pageUrl?: string): Promise<RawArticle[]> {
  const token = process.env.FACEBOOK_ACCESS_TOKEN;

  if (!token) return [];

  try {
    const id = pageId ?? (pageUrl ? await resolvePageId(pageUrl, token) : null);
    if (!id) return [];

    const url = `https://graph.facebook.com/v18.0/${id}/posts?fields=id,message,created_time,permalink_url&access_token=${token}&limit=20`;

    const res = await fetch(url);
    if (!res.ok) {
      console.warn("Facebook API error:", res.status, await res.text());
      return [];
    }

    const data = (await res.json()) as {
      data?: Array<{ id: string; message?: string; created_time: string; permalink_url?: string }>;
    };

    const posts = data.data ?? [];
    const articles: RawArticle[] = [];

    for (const post of posts) {
      const text = post.message ?? "";
      if (!matchesAgricultureKeywords(text)) continue;

      articles.push({
        title: text.slice(0, 200),
        content: text,
        url: post.permalink_url ?? `https://facebook.com/${post.id}`,
        sourceName: `Facebook: ${id}`,
        sourceType: "facebook",
        publishedAt: new Date(post.created_time),
      });
    }

    return articles;
  } catch (error) {
    console.error("Facebook fetch error:", error);
    return [];
  }
}

async function resolvePageId(pageUrl: string, token: string): Promise<string | null> {
  try {
    const url = `https://graph.facebook.com/v18.0/?id=${encodeURIComponent(pageUrl)}&access_token=${token}`;
    const res = await fetch(url);
    const data = (await res.json()) as { id?: string };
    return data.id ?? null;
  } catch {
    return null;
  }
}
