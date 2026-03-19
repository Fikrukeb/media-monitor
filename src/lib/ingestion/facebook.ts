/**
 * Facebook fetcher - uses Graph API when FACEBOOK_ACCESS_TOKEN is set
 * Falls back to mock data if no API key
 */
import { matchesAgricultureKeywords } from "./keywords";
import type { RawArticle } from "./sources";

const MOCK_FACEBOOK_POSTS: RawArticle[] = [
  {
    title: "Ministry of Agriculture Ethiopia - Coffee production update",
    content: "Ethiopia's coffee sector continues to grow. Farmers in Oromia and Sidama report improved yields. We are working with partners to expand export markets.",
    url: "https://www.facebook.com/FAO",
    sourceName: "Facebook",
    sourceType: "facebook",
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    title: "FAO Ethiopia - Livestock vaccination campaign",
    content: "FAO supports livestock vaccination in Ethiopia. Over 10,000 animals vaccinated in Somali region. Partnership with local authorities continues.",
    url: "https://www.facebook.com/EthiopianAgriculturalAuthority",
    sourceName: "Facebook",
    sourceType: "facebook",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    title: "Ethiopian Agriculture - Teff export news",
    content: "Teff exports to EU markets increase. New quality standards in place. Farmers benefiting from improved prices.",
    url: "https://www.facebook.com/FAO",
    sourceName: "Facebook",
    sourceType: "facebook",
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
];

export async function fetchFacebook(
  pageId?: string,
  pageUrl?: string,
  useMockFallback = true
): Promise<RawArticle[]> {
  const token = process.env.FACEBOOK_ACCESS_TOKEN;

  if (!token && useMockFallback) {
    return MOCK_FACEBOOK_POSTS.filter((p) =>
      matchesAgricultureKeywords(`${p.title} ${p.content}`)
    );
  }

  if (!token) return [];

  try {
    const id = pageId ?? (pageUrl ? await resolvePageId(pageUrl, token) : null);
    if (!id) return useMockFallback ? MOCK_FACEBOOK_POSTS : [];

    const url = `https://graph.facebook.com/v18.0/${id}/posts?fields=id,message,created_time,permalink_url&access_token=${token}&limit=20`;

    const res = await fetch(url);
    if (!res.ok) {
      console.warn("Facebook API error:", res.status, await res.text());
      return useMockFallback ? MOCK_FACEBOOK_POSTS : [];
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
    return useMockFallback ? MOCK_FACEBOOK_POSTS : [];
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
