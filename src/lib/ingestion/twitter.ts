/**
 * Twitter/X fetcher — uses Twitter API v2 when TWITTER_BEARER_TOKEN is set.
 * Returns [] if there is no token or the request fails (no mock data).
 */
import { matchesAgricultureKeywords } from "./keywords";
import type { RawArticle } from "./sources";

export async function fetchTwitter(handle?: string): Promise<RawArticle[]> {
  const token = process.env.TWITTER_BEARER_TOKEN;

  if (!token) return [];

  try {
    const searchQuery = handle
      ? `from:${handle} (Ethiopia OR agriculture OR coffee OR teff OR farming)`
      : "(Ethiopia agriculture) OR (Ethiopia coffee) OR (Ethiopia farming) OR (teff Ethiopia)";

    const url = new URL("https://api.twitter.com/2/tweets/search/recent");
    url.searchParams.set("query", searchQuery);
    url.searchParams.set("max_results", "20");
    url.searchParams.set("tweet.fields", "created_at,text");
    url.searchParams.set("expansions", "author_id");
    url.searchParams.set("user.fields", "username");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.warn("Twitter API error:", res.status, await res.text());
      return [];
    }

    const data = (await res.json()) as {
      data?: Array<{ id: string; text: string; created_at: string }>;
      includes?: { users?: Array<{ username: string }> };
    };

    const tweets = data.data ?? [];
    const users = data.includes?.users ?? [];
    const username = users[0]?.username ?? handle ?? "unknown";

    const articles: RawArticle[] = [];

    for (const tweet of tweets) {
      const text = tweet.text;
      if (!matchesAgricultureKeywords(text)) continue;

      articles.push({
        title: text.slice(0, 200),
        content: text,
        url: `https://twitter.com/${username}/status/${tweet.id}`,
        sourceName: `Twitter/X: @${username}`,
        sourceType: "twitter",
        publishedAt: new Date(tweet.created_at),
      });
    }

    return articles;
  } catch (error) {
    console.error("Twitter fetch error:", error);
    return [];
  }
}
